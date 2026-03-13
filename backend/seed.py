"""
Database seeder — creates demo users and sample assets on first run.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import User, Asset, AuditLog
from auth import hash_password


async def seed_data(db: AsyncSession):
    """Insert demo data if the database is empty."""

    # Check if already seeded
    result = await db.execute(select(User))
    if result.first():
        return  # Already seeded

    # ── Users ──────────────────────────────────────────────────────
    admin = User(
        username="admin",
        hashed_password=hash_password("admin123"),
        role="admin",
    )
    operator = User(
        username="operator",
        hashed_password=hash_password("operator123"),
        role="operator",
    )
    db.add_all([admin, operator])
    await db.flush()

    # ── Sample Assets ──────────────────────────────────────────────
    assets_data = [
        {"name": "Medical Scanner",        "serial_number": "SN-9982", "location": "Warehouse A",   "status": "Registered"},
        {"name": "Portable Defibrillator", "serial_number": "SN-4410", "location": "Warehouse B",   "status": "In Warehouse"},
        {"name": "Surgical Kit Alpha",     "serial_number": "SN-7721", "location": "Truck 2",       "status": "In Transit"},
        {"name": "Lab Centrifuge",         "serial_number": "SN-3305", "location": "Lab C",         "status": "Delivered"},
        {"name": "X-Ray Machine",          "serial_number": "SN-6618", "location": "Warehouse A",   "status": "Under Maintenance"},
    ]

    for data in assets_data:
        asset = Asset(**data)
        db.add(asset)
        await db.flush()

        # Initial audit log
        audit = AuditLog(
            asset_id=asset.id,
            action="CREATED",
            old_status=None,
            new_status=data["status"],
            old_location=None,
            new_location=data["location"],
            changed_by="system",
        )
        db.add(audit)

    await db.commit()
    print("✅ Database seeded with demo users and sample assets.")
