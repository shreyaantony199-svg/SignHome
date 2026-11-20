"""
SignHome Emergency & Safety SOS Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any

from ..database.mongodb import db_manager
from ..models.schemas import EmergencyMessage, EmergencyProfileUpdate, SafePlaceCheckIn

router = APIRouter(prefix="/emergency", tags=["Emergency & Safety"])

PREDEFINED_EMERGENCY_MESSAGES = [
    EmergencyMessage(
        id="sos-med-1",
        title="Call Ambulance",
        category="medical",
        english_text="Please call an ambulance immediately. I need urgent medical care.",
        tamil_text="தயவுசெய்து உடனடியாக ஆம்புலன்ஸை அழைக்கவும். எனக்கு அவசர மருத்துவ சிகிச்சை தேவை.",
        audio_tts="Please call an ambulance immediately. I need urgent medical care.",
        demonstration_term="Ambulance",
        priority="critical"
    ),
    EmergencyMessage(
        id="sos-danger-2",
        title="Personal Safety Danger",
        category="personal_safety",
        english_text="I am in danger! Please help me or call the police right now.",
        tamil_text="நான் ஆபத்தில் உள்ளேன்! தயவுசெய்து எனக்கு உதவுங்கள் அல்லது உடனடியாக காவல்துறையை அழைக்கவும்.",
        audio_tts="I am in danger! Please help me or call the police right now.",
        demonstration_term="Danger",
        priority="critical"
    ),
    EmergencyMessage(
        id="sos-deaf-3",
        title="Deaf Communication Note",
        category="general",
        english_text="I cannot hear you. I communicate using Indian Sign Language. Please write down what you want to say.",
        tamil_text="என்னால் உங்கள் பேச்சைக் கேட்க முடியாது. நான் இந்திய சைகை மொழியைப் பயன்படுத்தி தொடர்பு கொள்கிறேன். நீங்கள் கூற விரும்புவதை எழுதிக் காட்டுங்கள்.",
        audio_tts="I cannot hear you. I communicate using Indian Sign Language. Please write down what you want to say.",
        demonstration_term="Deaf",
        priority="high"
    ),
    EmergencyMessage(
        id="sos-pain-4",
        title="Severe Chest Pain / Breathing",
        category="medical",
        english_text="I am experiencing severe chest pain and difficulty breathing. Please get medical help.",
        tamil_text="எனக்கு கடுமையான மார்பு வலியும் சுவாச பிரச்சனையும் ஏற்படுகிறது. அவசர சிகிச்சை தேவை.",
        audio_tts="I am experiencing severe chest pain and difficulty breathing. Please get medical help.",
        demonstration_term="Pain",
        priority="critical"
    ),
    EmergencyMessage(
        id="sos-police-5",
        title="Police Assistance",
        category="police",
        english_text="I need immediate police assistance. There has been a road accident or emergency.",
        tamil_text="எனக்கு உடனடி காவல் உதவி தேவை. விபத்து நடந்துள்ளது.",
        audio_tts="I need immediate police assistance. There has been an accident or emergency.",
        demonstration_term="Police",
        priority="critical"
    ),
    EmergencyMessage(
        id="sos-fire-6",
        title="Fire Emergency",
        category="fire",
        english_text="Fire emergency! Call fire fighters immediately!",
        tamil_text="தீ விபத்து! உடனடியாக தீயணைப்பு படையை அழைக்கவும்!",
        audio_tts="Fire emergency! Call fire fighters immediately!",
        demonstration_term="Fire",
        priority="critical"
    )
]

@router.get("/messages", response_model=List[EmergencyMessage])
def get_emergency_messages():
    return PREDEFINED_EMERGENCY_MESSAGES

@router.get("/profile")
def get_emergency_profile():
    col = db_manager.get_collection("emergency_profiles")
    profile = col.find_one({})
    if not profile:
        return {
            "primary_contact_name": "Dr. Ramesh Kumar (Guardian)",
            "primary_contact_phone": "+91 98765 43210",
            "secondary_contact_name": "Priya Sharma (Sister)",
            "secondary_contact_phone": "+91 91234 56789",
            "blood_group": "B+ Positive",
            "allergies": "Penicillin, Dust",
            "chronic_conditions": "Asthma (Carries inhaler)",
            "preferred_hospital": "City General Hospital, Coimbatore",
            "sign_language_user_note": "I am Deaf/Hard of Hearing. I communicate using Indian Sign Language (ISL)."
        }
    if "_id" in profile:
        profile["_id"] = str(profile["_id"])
    return profile

@router.post("/profile")
def save_emergency_profile(profile_in: EmergencyProfileUpdate):
    col = db_manager.get_collection("emergency_profiles")
    col.delete_one({})
    res = col.insert_one(profile_in.dict())
    return {"status": "success", "profile_id": str(res.inserted_id)}

@router.post("/safeplace/checkin")
def add_safeplace_checkin(checkin: SafePlaceCheckIn):
    col = db_manager.get_collection("safety_checkins")
    res = col.insert_one(checkin.dict())
    return {"status": "success", "checkin_id": str(res.inserted_id)}

@router.get("/safeplace/checkins")
def list_safeplace_checkins():
    col = db_manager.get_collection("safety_checkins")
    items = col.find({}, limit=10, sort=[("created_at", -1)])
    for it in items:
        if "_id" in it:
            it["_id"] = str(it["_id"])
    return items
