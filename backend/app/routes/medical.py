"""
SignHome Medical Assistant API Routes
"""

from fastapi import APIRouter
from typing import Dict, Any, List
from ..database.mongodb import db_manager
from ..models.schemas import MedicalReportCreate

router = APIRouter(prefix="/medical", tags=["Medical Assistant"])

@router.post("/report")
def save_medical_report(report: MedicalReportCreate):
    col = db_manager.get_collection("medical_records")
    res = col.insert_one(report.dict())
    return {"status": "success", "report_id": str(res.inserted_id)}

@router.get("/reports")
def get_medical_reports():
    col = db_manager.get_collection("medical_records")
    items = col.find({}, limit=15, sort=[("created_at", -1)])
    for it in items:
        if "_id" in it:
            it["_id"] = str(it["_id"])
    return items

@router.get("/symptoms-catalog")
def get_symptoms_catalog():
    return {
        "body_parts": [
            {"id": "head", "name": "Head & Brain", "sign": "Headache", "tamil": "தலை"},
            {"id": "chest", "name": "Chest & Heart", "sign": "Heart Attack", "tamil": "மார்பு"},
            {"id": "stomach", "name": "Stomach & Abdomen", "sign": "Stomach Pain", "tamil": "வயிறு"},
            {"id": "throat", "name": "Throat & Neck", "sign": "Cough", "tamil": "தொண்டை"},
            {"id": "limbs", "name": "Arms & Legs", "sign": "Fracture", "tamil": "கைகள் / கால்கள்"},
            {"id": "skin", "name": "Skin & Allergy", "sign": "Allergy", "tamil": "தோல்"}
        ],
        "symptoms": [
            {"id": "pain", "label": "Severe Pain", "sign": "Pain", "tamil": "கடுமையான வலி"},
            {"id": "fever", "label": "High Fever & Chills", "sign": "Fever", "tamil": "காய்ச்சல்"},
            {"id": "breathing", "label": "Breathing Shortness", "sign": "Breathing Problem", "tamil": "சுவாச பிரச்சனை"},
            {"id": "cough", "label": "Persistent Cough", "sign": "Cough", "tamil": "தொடர் இருமல்"},
            {"id": "injury", "label": "Physical Injury / Bleeding", "sign": "Injury", "tamil": "காயம் / இரத்தப்போக்கு"},
            {"id": "allergy", "label": "Allergic Reaction / Itch", "sign": "Allergy", "tamil": "ஒவ்வாமை"},
            {"id": "fracture", "label": "Bone Fracture / Sprain", "sign": "Fracture", "tamil": "எலும்பு முறிவு"},
            {"id": "dizziness", "label": "Dizziness / Fainting", "sign": "Tired", "tamil": "தலைசுற்றல்"}
        ]
    }
