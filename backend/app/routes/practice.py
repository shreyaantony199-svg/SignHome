"""
SignHome Practice Arena & Quizzes API
"""

import random
from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Dict, Any, Optional

from ..database.mongodb import db_manager
from ..models.schemas import QuizQuestion, QuizSubmission, PracticeAttemptCreate
from .auth import get_current_user

router = APIRouter(prefix="/practice", tags=["Practice Arena"])

@router.get("/quiz", response_model=List[QuizQuestion])
def get_quiz_questions(
    quiz_type: str = Query("vocabulary", description="vocabulary, alphabet, numbers, emergency"),
    count: int = Query(5, ge=1, le=20)
):
    vocab_col = db_manager.get_collection("isl_vocabulary")
    
    query = {}
    if quiz_type == "alphabet":
        query = {"category": "Alphabet"}
    elif quiz_type == "numbers":
        query = {"category": "Numbers"}
    elif quiz_type == "emergency":
        query = {"category": {"$in": ["Emergency & Safety", "Medical & Health"]}}
        
    candidates = vocab_col.find(query)
    if not candidates:
        candidates = vocab_col.find({})
        
    selected = random.sample(candidates, min(len(candidates), count))
    all_terms = [c["term"] for c in candidates]
    
    questions = []
    for idx, item in enumerate(selected):
        wrong_options = [t for t in all_terms if t != item["term"]]
        sampled_wrong = random.sample(wrong_options, min(3, len(wrong_options)))
        options = [item["term"]] + sampled_wrong
        random.shuffle(options)
        
        q = QuizQuestion(
            id=f"quiz_q_{idx}_{item.get('id', item['term'])}",
            type="sign_to_meaning",
            question="Identify the correct English term for this Indian Sign Language demonstration:",
            term=item["term"],
            tamil_meaning=item.get("tamil_meaning", ""),
            options=options,
            correct_answer=item["term"],
            explanation=item.get("description", "Standard ISL dictionary sign demonstration from ARGISL / FDMSE."),
            demonstration_url=item.get("demonstration_url"),
            image_url=item.get("image_url")
        )
        questions.append(q)
        
    return questions

@router.post("/attempt")
def record_attempt(attempt: PracticeAttemptCreate):
    attempts_col = db_manager.get_collection("practice_attempts")
    res = attempts_col.insert_one(attempt.dict())
    return {"status": "success", "attempt_id": str(res.inserted_id)}

@router.post("/submit-quiz")
def submit_quiz(submission: QuizSubmission):
    quiz_col = db_manager.get_collection("quiz_submissions")
    res = quiz_col.insert_one(submission.dict())
    return {
        "status": "success",
        "submission_id": str(res.inserted_id),
        "percentage": round((submission.score / max(1, submission.total_questions)) * 100, 1)
    }
