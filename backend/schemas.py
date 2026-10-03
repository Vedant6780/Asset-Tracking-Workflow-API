"""
Pydantic schemas for strict request/response validation.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# ── Authentication & Users ─────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50, description="Username")
    password: str = Field(..., min_length=1, max_length=128, description="Password")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    role: str
    created_at: datetime


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username (at least 3 characters)")
    password: str = Field(..., min_length=6, max_length=128, description="Password (at least 6 characters)")
    role: str = Field("operator", description="Role: 'operator' or 'manager' / 'admin'")


class RegisterResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    user: UserResponse


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str


# ── Asset ──────────────────────────────────────────────────────────

class AssetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Asset name")
    serial_number: str = Field(..., min_length=1, max_length=50, description="Unique serial number")
    location: str = Field("Warehouse A", max_length=100, description="Initial location")


class AssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    serial_number: str
    status: str
    location: str
    created_at: datetime
    updated_at: datetime


class StatusUpdate(BaseModel):
    new_status: str = Field(..., min_length=1, max_length=50, description="New status value")
    location: Optional[str] = Field(None, max_length=100, description="Updated location")


class StatusUpdateResponse(BaseModel):
    asset_id: int
    new_status: str
    location: str
    updated_at: datetime


# ── Audit Log ──────────────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    asset_id: int
    action: str
    old_status: Optional[str]
    new_status: str
    old_location: Optional[str]
    new_location: Optional[str]
    changed_by: str
    changed_at: datetime


class AssetDetailResponse(BaseModel):
    """Asset with full audit history."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    serial_number: str
    status: str
    location: str
    created_at: datetime
    updated_at: datetime
    audit_logs: List[AuditLogResponse] = []
