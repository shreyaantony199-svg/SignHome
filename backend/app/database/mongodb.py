"""
SignHome Database Layer
Supports real MongoDB (PyMongo/Motor) with automatic seamless local JSON fallback
Ensures SignHome operates reliably whether MongoDB daemon is running or not.
"""

import os
import json
import re
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "backend" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "signhome_db")

class CollectionFallback:
    def __init__(self, name: str, file_path: Path):
        self.name = name
        self.file_path = file_path
        self._data: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except Exception:
                self._data = []
        else:
            self._data = []

    def _save(self):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2, default=str, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving collection {self.name}: {e}")

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for key, val in query.items():
            if key == "$or":
                sub_queries = val
                if not any(self._matches(doc, sq) for sq in sub_queries):
                    return False
                continue
            if key == "$and":
                sub_queries = val
                if not all(self._matches(doc, sq) for sq in sub_queries):
                    return False
                continue

            doc_val = doc.get(key)
            if isinstance(val, dict):
                # Operators
                if "$regex" in val:
                    pattern = val["$regex"]
                    flags = re.IGNORECASE if val.get("$options") == "i" else 0
                    if doc_val is None or not re.search(pattern, str(doc_val), flags):
                        return False
                elif "$in" in val:
                    if doc_val not in val["$in"]:
                        return False
                elif "$eq" in val:
                    if doc_val != val["$eq"]:
                        return False
                elif "$ne" in val:
                    if doc_val == val["$ne"]:
                        return False
            else:
                if doc_val != val:
                    return False
        return True

    def find_one(self, query: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        query = query or {}
        for doc in self._data:
            if self._matches(doc, query):
                return doc.copy()
        return None

    def find(self, query: Dict[str, Any] = None, skip: int = 0, limit: int = 0, sort: Optional[List[tuple]] = None) -> List[Dict[str, Any]]:
        query = query or {}
        results = [doc.copy() for doc in self._data if self._matches(doc, query)]
        if sort:
            for field, direction in reversed(sort):
                results.sort(key=lambda x: x.get(field, ""), reverse=(direction < 0))
        if skip > 0:
            results = results[skip:]
        if limit > 0:
            results = results[:limit]
        return results

    def count_documents(self, query: Dict[str, Any] = None) -> int:
        query = query or {}
        return sum(1 for doc in self._data if self._matches(doc, query))

    def insert_one(self, doc: Dict[str, Any]):
        new_doc = doc.copy()
        if "_id" not in new_doc:
            new_doc["_id"] = str(uuid.uuid4())
        if "created_at" not in new_doc:
            new_doc["created_at"] = datetime.utcnow().isoformat()
        self._data.append(new_doc)
        self._save()
        return type("InsertResult", (), {"inserted_id": new_doc["_id"]})()

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        for idx, doc in enumerate(self._data):
            if self._matches(doc, query):
                if "$set" in update:
                    self._data[idx].update(update["$set"])
                else:
                    self._data[idx].update(update)
                self._data[idx]["updated_at"] = datetime.utcnow().isoformat()
                self._save()
                return type("UpdateResult", (), {"modified_count": 1})()
        return type("UpdateResult", (), {"modified_count": 0})()

    def delete_one(self, query: Dict[str, Any]):
        for idx, doc in enumerate(self._data):
            if self._matches(doc, query):
                del self._data[idx]
                self._save()
                return type("DeleteResult", (), {"deleted_count": 1})()
        return type("DeleteResult", (), {"deleted_count": 0})()


class DatabaseManager:
    def __init__(self):
        self.use_mongo = False
        self.mongo_client = None
        self.db = None
        self._collections: Dict[str, CollectionFallback] = {}
        self.init_database()

    def init_database(self):
        try:
            from pymongo import MongoClient
            client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1500)
            client.server_info() # Test connection
            self.mongo_client = client
            self.db = client[MONGODB_DB_NAME]
            self.use_mongo = True
            print(f"[SignHome DB] Connected to active MongoDB at {MONGODB_URI}/{MONGODB_DB_NAME}")
        except Exception as e:
            self.use_mongo = False
            print(f"[SignHome DB] Local MongoDB unavailable ({e}). Running on robust Local JSON Persistence Layer.")

    def get_collection(self, name: str):
        if self.use_mongo and self.db is not None:
            return self.db[name]
        if name not in self._collections:
            file_path = DATA_DIR / f"{name}.json"
            self._collections[name] = CollectionFallback(name, file_path)
        return self._collections[name]

    def seed_initial_vocabulary(self):
        """Seed ISL vocabulary and metadata from online datasets if collection is empty"""
        vocab_col = self.get_collection("isl_vocabulary")
        meta_col = self.get_collection("sign_sources")

        current_count = vocab_col.count_documents({})
        if current_count == 0:
            dict_file = BASE_DIR / "dataset" / "vocabulary" / "isl_complete_dictionary.json"
            if dict_file.exists():
                with open(dict_file, "r", encoding="utf-8") as f:
                    entries = json.load(f)
                    for entry in entries:
                        vocab_col.insert_one(entry)
                print(f"[SignHome DB] Seeded {len(entries)} verified ISL vocabulary entries into database.")

            meta_file = BASE_DIR / "dataset" / "metadata" / "source_registry.json"
            if meta_file.exists():
                with open(meta_file, "r", encoding="utf-8") as f:
                    meta = json.load(f)
                    meta_col.insert_one(meta)
                print("[SignHome DB] Seeded source registry and attribution metadata.")

db_manager = DatabaseManager()
