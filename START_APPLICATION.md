# 🚀 FleetTrack OS - Complete Application Startup Guide

## ✅ Prerequisites Checklist

Before starting, ensure you have:
- [ ] Docker Desktop installed and **RUNNING** on Windows
- [ ] Ports 3000, 5432, and 8000 are available (not used by other applications)
- [ ] Git Bash or PowerShell available

---

## 🎯 Quick Start (Recommended)

### Option 1: Docker Compose (All Services Together)

1. **Start Docker Desktop** and wait until it's fully running

2. **Open PowerShell as Administrator** and navigate to the project:
   ```powershell
   cd "d:\workflow API"
   ```

3. **Build and start all services**:
   ```powershell
   docker-compose up --build
   ```

4. **Wait for services to start** (you'll see logs from all services):
   - PostgreSQL database starts first
   - Backend FastAPI starts and connects to database
   - Frontend Vite dev server starts

5. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs

### Option 2: Run Services Individually (For Development)

If Docker is giving issues or you want more control:

#### Step 1: Start PostgreSQL Database

**Option A: Using Docker**
```powershell
docker run -d `
  --name fleettrack_postgres `
  -e POSTGRES_DB=asset_tracking `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -p 5432:5432 `
  postgres:15-alpine
```

**Option B: Using local PostgreSQL**
- Ensure PostgreSQL is installed and running
- Create database: `CREATE DATABASE asset_tracking;`

#### Step 2: Start Backend

1. **Navigate to backend directory**:
   ```powershell
   cd "d:\workflow API\backend"
   ```

2. **Create/activate virtual environment**:
   ```powershell
   # Create venv if it doesn't exist
   python -m venv venv
   
   # Activate venv
   .\venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Set environment variables** (optional, defaults work for local):
   ```powershell
   $env:DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/asset_tracking"
   $env:SECRET_KEY="your-secret-key-here"
   ```

5. **Run database migrations/seed**:
   ```powershell
   # This creates tables and adds initial data
   python seed.py
   ```

6. **Start the backend server**:
   ```powershell
   python -m uvicorn main:app --reload --port 8000
   ```

   You should see:
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
   INFO:     Started reloader process
   INFO:     Started server process
   INFO:     Waiting for application startup.
   INFO:     Application startup complete.
   ```

#### Step 3: Start Frontend

1. **Open a NEW PowerShell window** and navigate to frontend:
   ```powershell
   cd "d:\workflow API\frontend"
   ```

2. **Install dependencies** (if not already done):
   ```powershell
   npm install
   ```

3. **Set environment variables** (optional):
   ```powershell
   $env:VITE_API_URL="http://127.0.0.1:8000"
   ```

4. **Start the Vite dev server**:
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:3000/
   ➜  Network: use --host to expose
   ```

5. **Open your browser** to http://localhost:3000

---

## 🧪 Testing the Application

### Test 1: Health Check
```powershell
curl http://localhost:8000/
```
**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Asset Tracking API",
  "version": "1.0.0"
}
```

### Test 2: API Documentation
Open in browser: http://localhost:8000/docs

You should see:
- ✅ Swagger UI interface
- ✅ Endpoints grouped by tags (auth, assets, websocket)
- ✅ Try it out buttons functional

### Test 3: User Registration

1. **Go to** http://localhost:3000
2. **Click** "Create Account" tab
3. **Fill in**:
   - Username: `testmanager`
   - Password: `password123`
   - Confirm Password: `password123`
   - Role: Select "Manager"
4. **Click** "Create Account"
5. **Expected**: Green success message → redirect to Manager Dashboard

### Test 4: User Login

1. **Sign out** if logged in
2. **Go to** http://localhost:3000
3. **Click** "Sign In" tab
4. **Fill in**:
   - Username: `testmanager`
   - Password: `password123`
5. **Click** "Sign In"
6. **Expected**: Redirect to Manager Dashboard

### Test 5: Operator Flow

1. **Create an operator account** (username: `testoperator`, role: Operator)
2. **Login** with operator credentials
3. **Test asset lookup**:
   - Enter asset code (e.g., `AST-001`)
   - Click "Scan Asset"
   - Should display asset details
4. **Update status**:
   - Change status dropdown
   - Click "Confirm Update"
   - Should show success message

### Test 6: Manager Dashboard

1. **Login as manager** (`testmanager`)
2. **Verify**:
   - ✅ Asset table displays with data
   - ✅ Status badges are color-coded
   - ✅ "Live" indicator shows green (WebSocket connected)
   - ✅ Audit panel on right side shows activity
3. **Open another browser/incognito** and login as operator
4. **Update an asset** as operator
5. **Watch manager dashboard** - it should update in real-time (without refresh)

---

## 🔧 Troubleshooting

### Issue: Docker won't start
**Solution:**
- Ensure Docker Desktop is running (check system tray)
- Restart Docker Desktop
- Check if Hyper-V/WSL2 is enabled (Windows Settings → Apps → Optional Features)

### Issue: Port 3000/8000/5432 already in use
**Solution:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <PID> /F

# Repeat for ports 3000 and 5432
```

### Issue: Backend can't connect to database
**Solution:**
1. Check PostgreSQL is running: `docker ps | findstr postgres`
2. Verify DATABASE_URL in backend/config.py or environment variable
3. Check credentials match docker-compose.yml

### Issue: Frontend shows CORS errors
**Solution:**
1. Ensure backend is running on port 8000
2. Check backend logs for CORS configuration
3. Verify VITE_API_URL environment variable
4. Clear browser cache and refresh

### Issue: WebSocket not connecting
**Solution:**
1. Check "Live" indicator on Manager Dashboard - should be green
2. Open browser DevTools → Network tab → WS filter
3. Look for WebSocket connection to `ws://localhost:8000/api/v1/ws/dashboard`
4. Ensure JWT token is valid (try logging out and back in)

### Issue: Login shows "Invalid credentials"
**Solution:**
1. Verify user was registered successfully
2. Check backend logs for authentication errors
3. Verify password was entered correctly
4. Try registering a new user

### Issue: Frontend build errors
**Solution:**
```powershell
cd "d:\workflow API\frontend"
# Remove node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

### Issue: Backend dependency errors
**Solution:**
```powershell
cd "d:\workflow API\backend"
# Recreate virtual environment
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 📊 Monitoring & Logs

### View Docker Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### View Backend Logs (when running locally)
Backend logs appear in the terminal where you ran `uvicorn main:app`

### View Frontend Logs (when running locally)
Frontend logs appear in the terminal where you ran `npm run dev`

### View Browser Console
1. Open DevTools (F12)
2. Console tab - for JavaScript errors
3. Network tab - for API request/response inspection
4. Application tab → Local Storage - to check stored tokens

---

## 🛑 Stopping the Application

### Docker Compose
```powershell
# Stop and remove containers
docker-compose down

# Stop, remove, and delete volumes (fresh start next time)
docker-compose down -v
```

### Individual Services
- Backend: Press `CTRL+C` in the terminal
- Frontend: Press `CTRL+C` in the terminal
- PostgreSQL Docker: `docker stop fleettrack_postgres`

---

## 🎨 Application Features Overview

### Login Page
- ✅ Toggle between Sign In / Create Account
- ✅ Role selection (Manager / Operator)
- ✅ Remember me checkbox
- ✅ Premium dark gradient UI with glassmorphic cards
- ✅ Responsive design

### Operator Dashboard (Warehouse Scanner Terminal)
- ✅ Asset lookup by code
- ✅ Display asset details (name, location, status, owner)
- ✅ Update asset status
- ✅ Clean, focused UI for warehouse floor use

### Manager Dashboard (Fleet Operations Center)
- ✅ Real-time asset table with live updates
- ✅ WebSocket connection status indicator
- ✅ Color-coded status badges
- ✅ Right-side audit panel showing all activity
- ✅ Refresh button to manually reload data
- ✅ User info badge with sign out

### Backend Features
- ✅ JWT authentication with role-based access
- ✅ Password hashing with bcrypt
- ✅ PostgreSQL database with asyncpg
- ✅ WebSocket support for real-time updates
- ✅ CRUD operations for assets
- ✅ Audit logging for all changes
- ✅ CORS configured for localhost and Lovable domains

---

## 📝 Default Credentials (from seed.py)

If you ran `python seed.py`, these users are available:

| Username | Password | Role |
|----------|----------|------|
| admin    | admin123 | admin (displays as Manager) |
| operator | operator123 | operator |

**⚠️ Change these credentials in production!**

---

## 🚀 Next Steps

1. **Test all features** using the test scenarios above
2. **Create your own accounts** for testing
3. **Explore the API documentation** at http://localhost:8000/docs
4. **Check real-time updates** by opening manager dashboard in two browsers
5. **Review the code** to understand the architecture

---

## 📚 Additional Documentation

- **Integration Guide**: See `INTEGRATION_GUIDE.md` for Lovable frontend integration
- **Project Documentation**: See `PROJECT_DOCUMENTATION.md` for architecture details
- **API Reference**: Visit http://localhost:8000/docs when backend is running
- **Troubleshooting**: See `TROUBLESHOOTING.md` (if exists) for common issues

---

## ✅ Success Criteria

Your application is working correctly if:

- [ ] Login page loads at http://localhost:3000 with FleetTrack OS branding
- [ ] New user registration works (data stored in PostgreSQL)
- [ ] Login validates credentials from database
- [ ] Operator can lookup and update assets
- [ ] Manager dashboard shows asset table
- [ ] "Live" indicator is green on manager dashboard
- [ ] Asset updates from operator appear instantly on manager dashboard (WebSocket)
- [ ] Audit panel shows all activities in real-time
- [ ] Sign out works and redirects to login
- [ ] No CORS errors in browser console
- [ ] Backend health check returns healthy status

---

**Need Help?** Check the troubleshooting section above or review the application logs for specific error messages.
