"""
Authentication Router — registration and login endpoints that authenticate against PostgreSQL and issue JWTs.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User
from schemas import LoginRequest, TokenResponse, RegisterRequest, RegisterResponse, UserResponse
from auth import verify_password, hash_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Create a new user account (Operator or Manager).
    Stores username and bcrypt-hashed password in the PostgreSQL database.
    """
    username = request.username.strip()
    if len(username) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be at least 3 characters long",
        )

    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long",
        )

    # Normalize role: manager -> admin for system consistency
    role_input = request.role.lower().strip()
    if role_input in ("manager", "admin"):
        normalized_role = "admin"
    elif role_input == "operator":
        normalized_role = "operator"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'operator' or 'manager'",
        )

    # Check if username already exists in PostgreSQL
    result = await db.execute(select(User).where(User.username == username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{username}' already exists. Please choose another username or sign in.",
        )

    # Hash plaintext password using bcrypt
    hashed = hash_password(request.password)

    # Create and persist new user in PostgreSQL
    new_user = User(
        username=username,
        hashed_password=hashed,
        role=normalized_role,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Automatically issue token for seamless onboarding
    access_token = create_access_token(data={"sub": new_user.username, "role": new_user.role})

    return RegisterResponse(
        message="Account created successfully",
        access_token=access_token,
        token_type="bearer",
        role=new_user.role,
        username=new_user.username,
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate an existing user (Operator or Manager).
    Verifies credentials against bcrypt-hashed password in the PostgreSQL database.
    """
    username = request.username.strip()

    # Look up user in PostgreSQL
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create token with role claim
    access_token = create_access_token(data={"sub": user.username, "role": user.role})

    return TokenResponse(
        access_token=access_token,
        role=user.role,
        username=user.username,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return currently authenticated user profile."""
    return current_user
