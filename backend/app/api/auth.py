from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Preset demo users for human-in-the-loop validation
MOCK_USERS = {
    "planner01": {"password": "password123", "role": "PLANNER", "user_id": "planner01"},
    "reviewer01": {"password": "password123", "role": "REVIEWER", "user_id": "reviewer01"},
    "admin01": {"password": "password123", "role": "ADMIN", "user_id": "admin01"},
    "viewer01": {"password": "password123", "role": "VIEWER", "user_id": "viewer01"}
}

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    user = MOCK_USERS.get(request.username)
    if not user or user["password"] != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )
    
    return TokenResponse(
        access_token=f"mock_token_{user['user_id']}",
        token_type="bearer",
        user_id=user["user_id"],
        role=user["role"]
    )
