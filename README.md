# 📦 Real-Time Asset Tracking & Workflow API

A real-time backend API and modern React frontend for tracking enterprise assets across a supply chain. This application replaces manual spreadsheet entry with instant status updates, role-based access control (RBAC), and live dashboard synchronization.

## 🚀 Features

- **Real-Time Dashboard**: Logistics managers get a live, auto-updating dashboard via WebSockets.
- **Role-Based Access Control (RBAC)**: Warehouse operators can scan/input asset IDs to update statuses, while managers have full CRUD access.
- **Immutable Audit Trail**: Every status change is comprehensively logged with the user and timestamp.
- **Modern UI/UX**: Built with React, featuring a custom glassmorphism design system, micro-animations, and responsive layouts.

## 🛠️ Technology Stack

### Backend
- **FastAPI**: High-performance Python web framework with native async and WebSocket support.
- **SQLAlchemy (Async)** & **aiosqlite**: Async ORM and zero-config SQLite database.
- **python-jose** & **passlib**: JWT-based authentication and bcrypt password hashing.

### Frontend
- **React 19**: Component-based UI with efficient re-renders for real-time data.
- **Vite**: Next-generation, lightning-fast build tool.
- **React Router**: Client-side routing with protected, role-aware routes.
- **Vanilla CSS**: Custom design system with glassmorphism and CSS animations without utility framework dependencies.

## 🏃‍♂️ How to Run the Project

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### 1. Start the Backend
```bash
cd backend
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate
# Activate virtual environment (Linux/Mac)
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
*The backend will be available at `http://localhost:8000`. Interactive API documentation can be found at `http://localhost:8000/docs`.*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The React application will be available at `http://localhost:5173`.*

### Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| **Manager (Admin)** | `admin` | `admin123` |
| **Operator** | `operator` | `operator123` |

## 📚 Documentation

For a comprehensive deep dive into the architecture, database design, WebSocket implementation, and security models, please see the full [Project Documentation](./PROJECT_DOCUMENTATION.md).
