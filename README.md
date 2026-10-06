# 🚛 FleetTrack OS — Real-Time Asset Tracking & Workflow API

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.3+-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade, real-time asset tracking and freight dispatch management platform. Built with **FastAPI**, **PostgreSQL (Asyncpg)**, **React 19**, and **WebSockets**, FleetTrack OS connects warehouse floor operations directly to executive logistics command with sub-second synchronization and an immutable audit trail.

---

## 🌟 Key Features

- **⚡ Real-Time WebSocket Telemetry**: Immediate broadcast of asset creation, status transitions, and deletions to connected manager dashboards without page reloads.
- **🛡️ Role-Based Access Control (RBAC)**:
  - **Fleet Operations Manager**: Full CRUD permissions, system metrics, real-time activity stream, and full historical audit logs.
  - **Warehouse Scanner Operator**: Optimized floor-terminal interface for rapid barcode/serial lookup and status dispatching.
- **📜 Immutable Audit Trail**: Every status transition records the previous state, new state, physical location, actor username, and UTC timestamp.
- **🔐 Enterprise Authentication**: Secure user registration, bcrypt-hashed passwords (cost factor 12), and role-signed JSON Web Tokens (PyJWT).
- **🎨 Glassmorphic Dark UI**: Custom-built design system with modern typography, glowing status indicators, smooth micro-animations, and zero utility-framework bloat.
- **🐳 Full Containerization**: One-command multi-container deployment orchestrating PostgreSQL with health checks, FastAPI backend, and Nginx frontend.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend (React 19 + Vite)"]
        A[Warehouse Operator Scanner] -->|REST API / Token Auth| C[FastAPI Gateway]
        B[Fleet Operations Manager] -->|REST API / Token Auth| C
        B -->|WebSocket Live Stream| WS[WebSocket Manager]
    end

    subgraph Backend ["Backend (FastAPI + SQLAlchemy 2.0 Async)"]
        C --> D[Auth Router & RBAC Middleware]
        C --> E[Asset Router]
        E --> WS
        D --> DB[(PostgreSQL Database)]
        E --> DB
    end

    subgraph Storage ["PostgreSQL 15"]
        DB --> U[Users Table]
        DB --> AS[Assets Table]
        DB --> AL[Audit Logs Table]
    end
```

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend Framework** | **FastAPI 0.115** | High-throughput asynchronous REST & WebSocket server |
| **Database Engine** | **PostgreSQL 15** | Relational persistence with async connection pooling |
| **Async ORM** | **SQLAlchemy 2.0** | Non-blocking async ORM queries with `asyncpg` driver |
| **Authentication** | **PyJWT + Passlib** | Role-claims signed JWTs + bcrypt password hashing |
| **Frontend Framework**| **React 19** | Concurrent UI rendering with component architecture |
| **Build Tool** | **Vite 7** | Sub-second HMR and optimized production bundles |
| **Routing** | **React Router 7** | Client-side routing with protected RBAC guards |
| **Styling** | **Custom CSS** | Premium glassmorphism design system & micro-animations |
| **Containerization** | **Docker & Docker Compose** | Multi-service stack with automated database healthchecks |

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. Ensure **Docker Desktop** is running.
2. In the project root directory, run:

```bash
docker-compose up --build
```

3. Access the services:
   - **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Option 2: Local Development Setup

#### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**
- **PostgreSQL 15+** running locally (or via Docker container)

#### Step 1: Start PostgreSQL Database
```powershell
# Using Docker for the database only:
docker run -d `
  --name workflowapi-db `
  -e POSTGRES_DB=asset_tracking `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -p 5432:5432 `
  postgres:15-alpine
```

#### Step 2: Backend Setup
```powershell
cd backend

# Create & activate virtual environment (Windows PowerShell)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run seed script (creates tables & initial demo records)
python seed.py

# Launch FastAPI development server
python -m uvicorn main:app --reload --port 8000
```

#### Step 3: Frontend Setup
```powershell
cd ..\frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

*The frontend will run at `http://localhost:5173` (or `http://localhost:3000` via Docker).*

---

## 🔐 Demo Credentials

The database seeder automatically configures the following default accounts:

| Role | Username | Password | Default View | Capabilities |
|---|---|---|---|---|
| **Fleet Manager** | `admin` | `admin123` | Fleet Operations Center | Full CRUD, Live WS feed, Audit Logs, Analytics |
| **Warehouse Operator** | `operator` | `operator123` | Scanner Terminal | Serial Lookup, Status Transitions, Location updates |

> 💡 **Self-Registration**: You can also create brand-new accounts directly from the login interface by selecting **"Create Account"**, choosing your desired role (**Manager** or **Operator**), and signing in immediately.

---

## 📡 API Reference

### Authentication Endpoints (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new Operator or Manager account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user and receive Bearer JWT |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve authenticated user profile |

### Asset Management Endpoints (`/api/v1/assets`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/assets/` | Manager | Retrieve all assets ordered by latest update |
| `POST` | `/api/v1/assets/` | Manager | Register a new asset into tracking system |
| `GET` | `/api/v1/assets/{id}` | Manager | Get asset details including complete audit history |
| `PUT` | `/api/v1/assets/{id}/status` | All Roles | Update asset status/location (triggers audit log & WS event) |
| `GET` | `/api/v1/assets/lookup/{serial}` | All Roles | Rapid serial number lookup for warehouse scanners |
| `DELETE` | `/api/v1/assets/{id}` | Manager | Remove an asset from the system |

### WebSocket Real-Time Channel (`/api/v1/ws`)
| Protocol | Endpoint | Access | Description |
|---|---|---|---|
| `WS` | `/api/v1/ws/dashboard?token={JWT}` | Manager | Live stream of `status_update`, `asset_created`, and `asset_deleted` events |

---

## 📁 Repository Structure

```
workflow API/
├── backend/                       # FastAPI asynchronous application
│   ├── routers/
│   │   ├── auth_router.py         # Login, registration, profile retrieval
│   │   ├── asset_router.py        # Asset CRUD, status dispatch, lookup
│   │   └── ws_router.py           # WebSocket dashboard streaming
│   ├── auth.py                    # JWT handling, hashing, and role checks
│   ├── config.py                  # Application configuration & allowed statuses
│   ├── database.py                # Async SQLAlchemy engine & session factory
│   ├── main.py                    # App entry point, CORS, and lifecycle seeder
│   ├── models.py                  # SQLAlchemy models: User, Asset, AuditLog
│   ├── schemas.py                 # Pydantic v2 validation schemas
│   ├── seed.py                    # Database seeding script
│   ├── websocket_manager.py       # WebSocket connection management
│   ├── requirements.txt           # Python package dependencies
│   └── Dockerfile                 # Backend container definition
│
├── frontend/                      # React 19 + Vite client application
│   ├── src/
│   │   ├── components/            # AssetTable, AuditPanel, LiveIndicator, StatusBadge
│   │   ├── context/               # AuthContext state management
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx      # Glassmorphic auth portal with tabbed switcher
│   │   │   ├── ManagerDashboard.jsx # Executive fleet operations control room
│   │   │   └── OperatorDashboard.jsx # Warehouse floor scanning terminal
│   │   ├── api.js                 # Axios API client & WebSocket factory
│   │   ├── index.css              # Custom design system styles & animations
│   │   ├── App.jsx                # Routing & RBAC route protection
│   │   └── main.jsx               # Application DOM bootstrap
│   ├── package.json               # Frontend dependencies & scripts
│   ├── vite.config.js             # Vite development server configuration
│   └── Dockerfile                 # Multi-stage production Nginx container
│
├── database/                      # Database configuration
│   ├── init.sql                   # SQL schema initialization
│   └── Dockerfile                 # Custom PostgreSQL image
│
├── docker-compose.yml             # Orchestration for DB, backend, & frontend
├── START_APPLICATION.md           # In-depth startup and testing walkthrough
├── PROJECT_DOCUMENTATION.md       # Full architectural breakdown & rationale
└── README.md                      # Project overview and quick start guide
```

---

## ⚙️ Environment Variables

### Backend Configuration
| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/asset_tracking` | Async SQLAlchemy DB connection URI |
| `SECRET_KEY` | `super-secret-key-change-in-production-env` | Cryptographic key for signing JWT tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` (8 hours) | Token lifespan |

### Frontend Configuration
| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend base URL for REST and WebSocket connections |

---

## 🔍 Verification & Testing

Verify end-to-end functionality using the following workflow:

1. **Service Health Check**:
   ```bash
   curl http://localhost:8000/
   # Response: {"status":"healthy","service":"Asset Tracking API","version":"1.0.0"}
   ```
2. **Operator Flow**:
   - Log in as `operator` / `operator123`.
   - Enter serial number `SN-9982` into the scanner terminal.
   - Change status to `In Transit` with location `Dock 4`.
   - Confirm status update notification.
3. **Manager Dashboard Flow**:
   - Open a separate browser window or tab and log in as `admin` / `admin123`.
   - Confirm the green **LIVE** pulse indicator is connected.
   - Observe that `SN-9982` reflects `In Transit` at `Dock 4` in real time without refreshing.
   - Click the asset to inspect the immutable audit log entry created by `operator`.

---

## 📖 Additional Documentation

For more in-depth technical documentation, refer to:
- **[START_APPLICATION.md](file:///d:/workflow%20API/START_APPLICATION.md)** — Comprehensive startup manual, detailed CLI procedures, and troubleshooting instructions.
- **[PROJECT_DOCUMENTATION.md](file:///d:/workflow%20API/PROJECT_DOCUMENTATION.md)** — Architectural design deep-dive, database schema specifications, and rationale.

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.
