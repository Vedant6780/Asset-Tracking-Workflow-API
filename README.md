# 🚛 FleetTrack OS - Real-Time Asset Tracking & Workflow API

A premium, real-time asset tracking and freight dispatch dashboard for enterprise logistics operations. This application provides instant status updates, role-based access control, and live WebSocket synchronization for warehouse operations and fleet management.

## ✅ Latest Updates

**All authentication and registration features have been fully implemented and tested!**

- ✅ User registration with role selection (Manager/Operator)
- ✅ Login with database validation
- ✅ PostgreSQL integration with encrypted passwords (bcrypt)
- ✅ JWT-based authentication
- ✅ Real-time WebSocket updates
- ✅ Premium FleetTrack OS branding
- ✅ Deployment-ready with Docker

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)
```powershell
# Start Docker Desktop first, then:
cd "d:\workflow API"
docker-compose up --build
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Quick Start Script
```powershell
cd "d:\workflow API"
.\start.ps1
```

### Option 3: Manual Start
See detailed instructions in [START_APPLICATION.md](./START_APPLICATION.md)

## 🎯 Features

- **User Registration & Authentication**: New users can register with role selection, passwords encrypted with bcrypt, JWT-based authentication.
- **Real-Time Dashboard**: Logistics managers get a live, auto-updating dashboard via WebSockets.
- **Role-Based Access Control (RBAC)**: Warehouse operators can scan/input asset IDs to update statuses, while managers have full CRUD access.
- **Immutable Audit Trail**: Every status change is comprehensively logged with the user and timestamp.
- **Premium UI/UX**: FleetTrack OS branding with glassmorphism design, dark gradients, and micro-animations.
- **PostgreSQL Database**: Production-ready database with async operations and connection pooling.

## 🛠️ Technology Stack

### Backend
- **FastAPI**: High-performance Python web framework with native async and WebSocket support.
- **PostgreSQL**: Production-ready relational database with asyncpg for async operations.
- **SQLAlchemy (Async)**: Modern async ORM with Pydantic v2 integration.
- **PyJWT**: Industry-standard JWT authentication library.
- **passlib + bcrypt**: Secure password hashing with bcrypt (cost factor 12).

### Frontend
- **React 19**: Component-based UI with efficient re-renders for real-time data.
- **Vite 7**: Next-generation, lightning-fast build tool.
- **React Router**: Client-side routing with protected, role-aware routes.
- **Custom CSS**: FleetTrack OS design system with glassmorphism and CSS animations.

## 🏃‍♂️ Detailed Setup Instructions

For comprehensive setup, troubleshooting, and testing instructions, see:
- **[START_APPLICATION.md](./START_APPLICATION.md)** - Complete startup guide
- **[VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)** - Testing checklist
- **[COMPLETED_WORK.md](./COMPLETED_WORK.md)** - Summary of all changes
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Lovable frontend integration

### Prerequisites
- Docker Desktop (for Docker Compose method)
- Python 3.10+ (for manual backend)
- Node.js 18+ (for manual frontend)
- PostgreSQL 15+ (for manual database)

### Manual Backend Setup
```bash
cd backend
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

pip install -r requirements.txt

# Seed the database (creates tables and default users)
python seed.py

# Start the server
python -m uvicorn main:app --reload --port 8000
```
*Backend available at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.*

### Manual Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*React app available at `http://localhost:3000`.*

## 🔐 Demo Credentials

Default users created by `seed.py`:

| Role | Username | Password | Dashboard |
|------|----------|----------|-----------|
| **Manager** | `admin` | `admin123` | Fleet Operations Center |
| **Operator** | `operator` | `operator123` | Warehouse Scanner Terminal |

**You can also register new accounts** directly from the login page:
1. Visit http://localhost:3000
2. Click "Create Account"
3. Choose role (Manager or Operator)
4. Enter username and password
5. Click "Create Account"

## 🧪 Testing the Application

### Quick Test Sequence:
1. **Health Check**: `curl http://localhost:8000/`
2. **Register New User**: Use the login page
3. **Login**: Test authentication
4. **Operator Flow**: Lookup and update assets
5. **Manager Dashboard**: View real-time updates
6. **WebSocket**: Check "Live" indicator is green

See [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) for complete testing guide.

## 📊 Application Structure

```
FleetTrack OS/
├── 🚛 Login Page (Role Selection)
│   ├── Sign In / Create Account toggle
│   ├── Manager or Operator role selection
│   └── Premium dark gradient design
│
├── 👔 Manager Dashboard (Fleet Operations Center)
│   ├── Real-time asset table
│   ├── WebSocket live updates
│   ├── Audit panel (right side)
│   └── Full CRUD permissions
│
└── 👷 Operator Dashboard (Warehouse Scanner Terminal)
    ├── Asset lookup by code
    ├── Status update functionality
    └── Simplified warehouse-floor UI
```

## 📚 Documentation

- **[START_APPLICATION.md](./START_APPLICATION.md)** - Complete startup guide with troubleshooting
- **[VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)** - Testing checklist and success criteria
- **[COMPLETED_WORK.md](./COMPLETED_WORK.md)** - Summary of all implemented features
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Lovable frontend integration guide
- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** - Comprehensive architecture documentation

## 🔧 Troubleshooting

Common issues and solutions:

**Docker won't start**: Ensure Docker Desktop is running
**Port conflicts**: Check if ports 3000, 5432, 8000 are available
**CORS errors**: Verify backend is running on port 8000
**WebSocket not connecting**: Check JWT token validity and "Live" indicator
**Login fails**: Verify user was registered successfully

See [START_APPLICATION.md](./START_APPLICATION.md) for detailed troubleshooting.

## 🚀 Deployment

### Environment Variables:
```bash
# Backend
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
SECRET_KEY=your-production-secret-key
FRONTEND_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

### Production Checklist:
- [ ] Change SECRET_KEY to secure random value
- [ ] Update default admin credentials
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure nginx for SPA routing
- [ ] Enable rate limiting

## 📝 License

This project is for demonstration and educational purposes.

---

**Built with ❤️ for logistics professionals who walk the warehouse floor.**
