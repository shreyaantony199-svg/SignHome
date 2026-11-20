"""
SignHome Pydantic Data Models & Validation Schemas
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- AUTH & USER ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6)
    role: Optional[str] = "user" # "user" or "admin"
    preferred_communication: Optional[str] = "ISL" # "ISL", "Speech", "Both"

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    preferred_communication: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    medical_notes: Optional[str] = None
    theme: Optional[str] = "light"
    high_contrast: Optional[bool] = False

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    preferred_communication: str
    emergency_contact_name: Optional[str] = ""
    emergency_contact_phone: Optional[str] = ""
    medical_notes: Optional[str] = ""
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- VOCABULARY & DICTIONARY ---
class ISLVocabularyEntry(BaseModel):
    id: str
    term: str
    alternative_names: List[str] = []
    english_meaning: str
    tamil_meaning: Optional[str] = ""
    category: str
    alphabet_index: str
    description: str
    demonstration_url: str
    embed_video_url: Optional[str] = None
    image_url: Optional[str] = None
    source_website: str
    source_id: str
    source_attribution: str
    verification_status: str
    availability_status: str
    tags: List[str] = []

class PaginatedVocabularyResponse(BaseModel):
    total_count: int
    page: int
    limit: int
    total_pages: int
    items: List[Dict[str, Any]]
    demonstrations_available_count: int
    demonstrations_unavailable_count: int
    categories: List[str]
    alphabets: List[str]

# --- RECOGNITION & ML ---
class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float

class RecognitionRequest(BaseModel):
    landmarks: Optional[Any] = None # 21 (x, y, z) landmarks or list of hands [h1, h2]
    second_hand_landmarks: Optional[List[List[float]]] = None
    features: Optional[List[float]] = None # Precomputed 129-D feature vector
    handedness: Optional[str] = "Right"

class RecognitionResponse(BaseModel):
    predicted_gesture: str
    confidence: float
    is_confident: bool
    tamil_meaning: Optional[str] = ""
    alternative_candidates: List[Dict[str, Any]] = []
    timestamp: str

class RecognitionHistoryCreate(BaseModel):
    phrase: str
    confidence_avg: float
    source: str = "live_camera"

# --- PRACTICE & QUIZ ---
class QuizQuestion(BaseModel):
    id: str
    type: str # "sign_to_meaning" or "meaning_to_sign"
    question: str
    term: str
    tamil_meaning: Optional[str] = ""
    options: List[str]
    correct_answer: str
    explanation: str
    demonstration_url: Optional[str] = None
    image_url: Optional[str] = None

class QuizSubmission(BaseModel):
    quiz_id: str
    category: str
    score: int
    total_questions: int
    answers: List[Dict[str, Any]]

class PracticeAttemptCreate(BaseModel):
    target_sign: str
    predicted_sign: str
    confidence: float
    matched: bool

# --- EMERGENCY & SAFETY ---
class EmergencyMessage(BaseModel):
    id: str
    title: str
    category: str # "medical", "police", "fire", "safety", "transport", "general"
    english_text: str
    tamil_text: str
    audio_tts: str
    demonstration_term: Optional[str] = None
    priority: str = "high"

class EmergencyProfileUpdate(BaseModel):
    primary_contact_name: str
    primary_contact_phone: str
    secondary_contact_name: Optional[str] = ""
    secondary_contact_phone: Optional[str] = ""
    blood_group: Optional[str] = ""
    allergies: Optional[str] = ""
    chronic_conditions: Optional[str] = ""
    preferred_hospital: Optional[str] = ""
    sign_language_user_note: str = "I am Deaf/Hard of Hearing. I communicate using Indian Sign Language (ISL)."

class SafePlaceCheckIn(BaseModel):
    status: str # "safe", "need_help", "arrived", "travelling"
    location_label: Optional[str] = "Manual Check-in"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    message: Optional[str] = ""

# --- MEDICAL ASSISTANT ---
class MedicalReportCreate(BaseModel):
    body_part: str
    symptoms: List[str]
    pain_intensity: int # 1 to 10
    duration: str
    additional_notes: Optional[str] = ""
    generated_sentence: str
    tamil_translation: Optional[str] = ""

# --- SAVED PHRASES ---
class SavedPhraseCreate(BaseModel):
    text: str
    tamil_text: Optional[str] = ""
    category: Optional[str] = "General"
    is_emergency: Optional[bool] = False

# --- DASHBOARD STATS ---
class DashboardStats(BaseModel):
    total_signs_learned: int
    daily_streak: int
    practice_accuracy: float
    total_quizzes_taken: int
    recent_signs: List[Dict[str, Any]]
    saved_phrases_count: int
    camera_sessions_count: int
    sign_of_the_day: Dict[str, Any]
