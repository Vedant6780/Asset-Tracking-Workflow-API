"""
Async SQLAlchemy engine, session factory, and Base declarative class.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from config import DATABASE_URL

# ── Engine & Session ───────────────────────────────────────────────
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# ── Declarative Base ───────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependency for FastAPI routes ──────────────────────────────────
async def get_db():
    """Yield an async database session for each request."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ── Init DB (create tables) ───────────────────────────────────────
async def init_db():
    """Create all tables that don't exist yet."""
    async with engine.begin() as conn:
        from models import User, Asset, AuditLog  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
