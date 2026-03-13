"""
Application configuration — JWT settings, database URL, and constants.
"""

# ── JWT Configuration ──────────────────────────────────────────────
SECRET_KEY = "super-secret-key-change-in-production-env"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# ── Database ───────────────────────────────────────────────────────
DATABASE_URL = "sqlite+aiosqlite:///./asset_tracking.db"

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
