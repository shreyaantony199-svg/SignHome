"""
SignHome Vocabulary & Dictionary API Routes
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, Dict, Any, List

from ..database.mongodb import db_manager
from ..models.schemas import PaginatedVocabularyResponse

router = APIRouter(prefix="/vocabulary", tags=["Vocabulary & Dictionary"])

@router.get("", response_model=PaginatedVocabularyResponse)
def get_vocabulary(
    q: Optional[str] = Query(None, description="Search query across English term, Tamil, or tags"),
    category: Optional[str] = Query(None, description="Filter by category"),
    alphabet: Optional[str] = Query(None, description="Filter by letter A-Z"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100)
):
    vocab_col = db_manager.get_collection("isl_vocabulary")
    
    query: Dict[str, Any] = {}
    if q and q.strip():
        regex_pattern = q.strip()
        query["$or"] = [
            {"term": {"$regex": regex_pattern, "$options": "i"}},
            {"tamil_meaning": {"$regex": regex_pattern, "$options": "i"}},
            {"category": {"$regex": regex_pattern, "$options": "i"}},
            {"description": {"$regex": regex_pattern, "$options": "i"}},
        ]
    
    if category and category != "All":
        query["category"] = category
        
    if alphabet and alphabet != "All":
        query["alphabet_index"] = alphabet.upper()

    total_count = vocab_col.count_documents(query)
    total_pages = max(1, (total_count + limit - 1) // limit)
    skip = (page - 1) * limit
    
    items = vocab_col.find(query, skip=skip, limit=limit, sort=[("term", 1)])
    
    # Clean Mongo _id for JSON serialization
    for item in items:
        if "_id" in item:
            item["_id"] = str(item["_id"])

    # Aggregate categories and alphabets
    all_docs = vocab_col.find({})
    categories = sorted(list(set(d.get("category", "") for d in all_docs if d.get("category"))))
    alphabets = sorted(list(set(d.get("alphabet_index", "") for d in all_docs if d.get("alphabet_index") and d.get("alphabet_index") != "#")))

    return PaginatedVocabularyResponse(
        total_count=total_count,
        page=page,
        limit=limit,
        total_pages=total_pages,
        items=items,
        demonstrations_available_count=total_count,
        demonstrations_unavailable_count=0,
        categories=["All"] + categories,
        alphabets=["All"] + alphabets
    )

@router.get("/sources")
def get_sources_metadata():
    meta_col = db_manager.get_collection("sign_sources")
    meta = meta_col.find_one({})
    if not meta:
        return {
            "sources": [
                {
                    "name": "ARGISL / RKMVERI",
                    "url": "https://cs.rkmvu.ac.in/~isl/",
                    "vocabulary_scope": "2,002 commonly used ISL glosses"
                },
                {
                    "name": "Indian Sign Language Portal",
                    "url": "https://indiansignlanguage.org/",
                    "vocabulary_scope": "Searchable A-Z with Tamil meanings"
                }
            ],
            "total_terms_indexed": 400
        }
    if "_id" in meta:
        del meta["_id"]
    return meta

@router.get("/sign-of-the-day")
def get_sign_of_the_day():
    vocab_col = db_manager.get_collection("isl_vocabulary")
    all_items = vocab_col.find({})
    if not all_items:
        raise HTTPException(status_code=404, detail="Vocabulary empty")
    from datetime import date
    day_idx = date.today().toordinal() % len(all_items)
    selected = all_items[day_idx]
    if "_id" in selected:
        selected["_id"] = str(selected["_id"])
    return selected

@router.get("/{term_id}")
def get_term_by_id(term_id: str):
    vocab_col = db_manager.get_collection("isl_vocabulary")
    term = vocab_col.find_one({"$or": [{"id": term_id}, {"term": {"$regex": f"^{term_id}$", "$options": "i"}}]})
    if not term:
        raise HTTPException(status_code=404, detail="Sign term not found")
    if "_id" in term:
        term["_id"] = str(term["_id"])
    return term
