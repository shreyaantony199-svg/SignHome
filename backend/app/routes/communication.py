"""
SignHome Communication & Saved Phrases Routes
"""

from fastapi import APIRouter
from typing import List, Dict, Any
from ..database.mongodb import db_manager
from ..models.schemas import SavedPhraseCreate

router = APIRouter(prefix="/communication", tags=["Daily & My Communication"])

@router.get("/saved-phrases")
def get_saved_phrases():
    col = db_manager.get_collection("saved_phrases")
    phrases = col.find({}, sort=[("created_at", -1)])
    if not phrases:
        defaults = [
            {"text": "I communicate using Indian Sign Language.", "tamil_text": "நான் இந்திய சைகை மொழியைப் பயன்படுத்தி தொடர்பு கொள்கிறேன்.", "category": "Personal", "is_emergency": False},
            {"text": "Where is the nearest hospital?", "tamil_text": "அருகிலுள்ள மருத்துவமனை எங்கே உள்ளது?", "category": "Medical", "is_emergency": True},
            {"text": "Please call an ambulance immediately.", "tamil_text": "தயவுசெய்து உடனடியாக ஆம்புலன்ஸை அழைக்கவும்.", "category": "Emergency", "is_emergency": True},
            {"text": "I need water, please.", "tamil_text": "எனக்கு தண்ணீர் வேண்டும், தயவுசெய்து.", "category": "Daily", "is_emergency": False},
        ]
        for d in defaults:
            col.insert_one(d)
        phrases = col.find({})
        
    for p in phrases:
        if "_id" in p:
            p["_id"] = str(p["_id"])
    return phrases

@router.post("/saved-phrases")
def add_saved_phrase(phrase: SavedPhraseCreate):
    col = db_manager.get_collection("saved_phrases")
    res = col.insert_one(phrase.dict())
    return {"status": "success", "id": str(res.inserted_id)}

@router.delete("/saved-phrases/{phrase_id}")
def delete_saved_phrase(phrase_id: str):
    col = db_manager.get_collection("saved_phrases")
    col.delete_one({"_id": phrase_id})
    return {"status": "success"}

@router.get("/transit-scenarios")
def get_transit_scenarios():
    return [
        {
            "category": "Railway Station",
            "phrases": [
                {"en": "Where is Platform 1?", "ta": "நடைமேடை 1 எங்கே உள்ளது?", "sign": "Train"},
                {"en": "When does the next train arrive?", "ta": "அடுத்த ரயில் எப்போது வரும்?", "sign": "Time"},
                {"en": "I need to purchase a ticket to Coimbatore.", "ta": "நான் கோவைக்கு டிக்கெட் வாங்க வேண்டும்.", "sign": "Ticket"}
            ]
        },
        {
            "category": "Bus Station",
            "phrases": [
                {"en": "Does this bus go to the general hospital?", "ta": "இந்தப் பேருந்து பொது மருத்துவமனைக்குச் செல்லுமா?", "sign": "Bus"},
                {"en": "Please notify me when my stop arrives.", "ta": "என் நிறுத்தம் வரும்போது எனக்குத் தெரியப்படுத்துங்கள்.", "sign": "Bus Stop"}
            ]
        },
        {
            "category": "Bank & Services",
            "phrases": [
                {"en": "I want to open a new savings account.", "ta": "நான் புதிய சேமிப்புக் கணக்கு தொடங்க விரும்புகிறேன்.", "sign": "Bank"},
                {"en": "Where is the cash deposit counter?", "ta": "பணம் செலுத்தும் கவுண்டர் எங்கே உள்ளது?", "sign": "Money"}
            ]
        },
        {
            "category": "College & Education",
            "phrases": [
                {"en": "Where is the computer science department?", "ta": "கணினி அறிவியல் துறை எங்கே உள்ளது?", "sign": "College"},
                {"en": "Could you provide today's lecture notes in text?", "ta": "இன்றைய பாடக் குறிப்புகளை எழுத்து வடிவில் தர முடியுமா?", "sign": "Book"}
            ]
        }
    ]
