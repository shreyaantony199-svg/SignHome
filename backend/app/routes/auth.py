"""
SignHome Authentication Routes
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Any

from ..models.schemas import UserRegister, UserLogin, UserProfileUpdate, TokenResponse, UserOut
from ..database.mongodb import db_manager
from ..services.auth_service import hash_password, verify_password, create_access_token, verify_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = verify_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_col = db_manager.get_collection("users")
    user = user_col.find_one({"_id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister):
    user_col = db_manager.get_collection("users")
    existing = user_col.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    new_user = {
        "name": user_in.name,
        "email": user_in.email.lower(),
        "password_hash": hash_password(user_in.password),
        "role": user_in.role or "user",
        "preferred_communication": user_in.preferred_communication or "ISL",
        "emergency_contact_name": "",
        "emergency_contact_phone": "",
        "medical_notes": "",
    }
    res = user_col.insert_one(new_user)
    user_id = str(res.inserted_id)

    access_token = create_access_token({"sub": user_id, "email": new_user["email"], "role": new_user["role"]})
    user_out = UserOut(
        id=user_id,
        name=new_user["name"],
        email=new_user["email"],
        role=new_user["role"],
        preferred_communication=new_user["preferred_communication"],
        emergency_contact_name="",
        emergency_contact_phone="",
        medical_notes=""
    )
    return TokenResponse(access_token=access_token, user=user_out)

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin):
    user_col = db_manager.get_collection("users")
    user = user_col.find_one({"email": login_in.email.lower()})
    if not user or not verify_password(login_in.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user_id = str(user["_id"])
    access_token = create_access_token({"sub": user_id, "email": user["email"], "role": user.get("role", "user")})
    user_out = UserOut(
        id=user_id,
        name=user["name"],
        email=user["email"],
        role=user.get("role", "user"),
        preferred_communication=user.get("preferred_communication", "ISL"),
        emergency_contact_name=user.get("emergency_contact_name", ""),
        emergency_contact_phone=user.get("emergency_contact_phone", ""),
        medical_notes=user.get("medical_notes", "")
    )
    return TokenResponse(access_token=access_token, user=user_out)

@router.get("/me", response_model=UserOut)
def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return UserOut(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        role=current_user.get("role", "user"),
        preferred_communication=current_user.get("preferred_communication", "ISL"),
        emergency_contact_name=current_user.get("emergency_contact_name", ""),
        emergency_contact_phone=current_user.get("emergency_contact_phone", ""),
        medical_notes=current_user.get("medical_notes", "")
    )

@router.put("/profile", response_model=UserOut)
def update_profile(updates: UserProfileUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_col = db_manager.get_collection("users")
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if update_data:
        user_col.update_one({"_id": current_user["_id"]}, {"$set": update_data})
    
    updated = user_col.find_one({"_id": current_user["_id"]})
    return UserOut(
        id=str(updated["_id"]),
        name=updated["name"],
        email=updated["email"],
        role=updated.get("role", "user"),
        preferred_communication=updated.get("preferred_communication", "ISL"),
        emergency_contact_name=updated.get("emergency_contact_name", ""),
        emergency_contact_phone=updated.get("emergency_contact_phone", ""),
        medical_notes=updated.get("medical_notes", "")
    )
