"""
Application configuration — JWT settings, database URL, and constants.
"""

import os

# ── JWT Configuration ──────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

# ── Database ───────────────────────────────────────────────────────
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/asset_tracking"
)

# ── Asset Status Options ───────────────────────────────────────────
ALLOWED_STATUSES = [
    "Registered",
    "In Warehouse",
    "In Transit",
    "Delivered",
    "Under Maintenance",
    "Decommissioned",
    "Damaged",
]
