"""
FastAPI Application Entry Point
──────────────────────────────
Real-Time Asset Tracking & Workflow API

- Lifespan: initializes DB tables and seeds demo data on startup
- CORS: allows the React dev server (localhost:5173)
- Routers: auth, assets, WebSocket
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db, async_session
from seed import seed_data
from routers.auth_router import router as auth_router
from routers.asset_router import router as asset_router
from routers.ws_router import router as ws_router


# ── Lifespan (startup / shutdown) ──────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed data on startup."""
    await init_db()
    async with async_session() as session:
        await seed_data(session)
    yield  # App runs here
    # Shutdown logic (if needed) goes after yield


# ── App Instance ───────────────────────────────────────────────────
app = FastAPI(
    title="Real-Time Asset Tracking API",
    description="Enterprise asset tracking with RBAC, real-time WebSocket updates, and audit logging.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS Middleware ────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite React dev server
        "http://localhost:3000",   # Alternative dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(asset_router)
app.include_router(ws_router)


# ── Health Check ───────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "Asset Tracking API", "version": "1.0.0"}
