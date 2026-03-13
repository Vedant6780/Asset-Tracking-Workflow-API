"""
Asset Router — CRUD endpoints for asset management with RBAC.
"""

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models import Asset, AuditLog, User
from schemas import (
    AssetCreate, AssetResponse, AssetDetailResponse,
    StatusUpdate, StatusUpdateResponse,
)
from auth import get_current_user, require_role
from websocket_manager import manager as ws_manager

router = APIRouter(prefix="/api/v1/assets", tags=["Assets"])


# ── GET all assets (Manager only) ─────────────────────────────────

@router.get("/", response_model=List[AssetResponse])
async def get_all_assets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Return a list of all assets. Manager only."""
    result = await db.execute(select(Asset).order_by(Asset.updated_at.desc()))
    return result.scalars().all()


# ── GET single asset with audit history (Manager only) ─────────────

@router.get("/{asset_id}", response_model=AssetDetailResponse)
async def get_asset(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Return a single asset with full audit trail. Manager only."""
    result = await db.execute(
        select(Asset)
        .options(selectinload(Asset.audit_logs))
        .where(Asset.id == asset_id)
    )
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


# ── POST create asset (Manager only) ──────────────────────────────

@router.post("/", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    payload: AssetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Create a new asset. Manager only."""
    # Check duplicate serial number
    existing = await db.execute(
        select(Asset).where(Asset.serial_number == payload.serial_number)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Serial number already exists")

    asset = Asset(
        name=payload.name,
        serial_number=payload.serial_number,
        location=payload.location,
        status="Registered",
    )
    db.add(asset)
    await db.flush()

    # Create initial audit log
    audit = AuditLog(
        asset_id=asset.id,
        action="CREATED",
        old_status=None,
        new_status="Registered",
        old_location=None,
        new_location=payload.location,
        changed_by=current_user.username,
    )
    db.add(audit)

    # Broadcast to live dashboards
    await ws_manager.broadcast({
        "event": "asset_created",
        "asset_id": asset.id,
        "name": asset.name,
        "serial_number": asset.serial_number,
        "status": asset.status,
        "location": asset.location,
        "updated_by": current_user.username,
    })

    return asset


# ── PUT update status (Operator & Manager) ─────────────────────────

@router.put("/{asset_id}/status", response_model=StatusUpdateResponse)
async def update_asset_status(
    asset_id: int,
    payload: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an asset's status. Available to both operators and managers."""
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    old_status = asset.status
    old_location = asset.location

    # Update asset
    asset.status = payload.new_status
    if payload.location:
        asset.location = payload.location
    asset.updated_at = datetime.now(timezone.utc)

    # Create audit log
    audit = AuditLog(
        asset_id=asset.id,
        action="STATUS_UPDATE",
        old_status=old_status,
        new_status=payload.new_status,
        old_location=old_location,
        new_location=asset.location,
        changed_by=current_user.username,
    )
    db.add(audit)

    # Broadcast to live dashboards
    await ws_manager.broadcast({
        "event": "status_update",
        "asset_id": asset.id,
        "name": asset.name,
        "serial_number": asset.serial_number,
        "old_status": old_status,
        "new_status": payload.new_status,
        "location": asset.location,
        "updated_by": current_user.username,
    })

    return StatusUpdateResponse(
        asset_id=asset.id,
        new_status=asset.status,
        location=asset.location,
        updated_at=asset.updated_at,
    )


# ── GET asset by serial number (Operator & Manager) ───────────────

@router.get("/lookup/{serial_number}", response_model=AssetResponse)
async def lookup_asset(
    serial_number: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Look up an asset by serial number. Available to both operators and managers."""
    result = await db.execute(
        select(Asset).where(Asset.serial_number == serial_number)
    )
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


# ── DELETE asset (Manager only) ────────────────────────────────────

@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Delete an asset. Manager only."""
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    await db.delete(asset)

    # Broadcast deletion
    await ws_manager.broadcast({
        "event": "asset_deleted",
        "asset_id": asset_id,
        "deleted_by": current_user.username,
    })
