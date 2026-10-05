# Lovable Frontend Integration Guide

This guide explains how to integrate your Lovable-built frontend with the FastAPI backend for the Real-Time Asset Tracking & Workflow application.

---

## Section 1 — Backend Overview

**Stack:**
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (via Docker) with asyncpg driver
- **Authentication:** JWT (JSON Web Tokens) with Bearer authentication
- **Real-time:** WebSocket for live dashboard updates
- **Password Security:** Bcrypt hashing with salt

**Base URLs:**
- **Development:** `http://localhost:8000`
- **Production:** Set via `VITE_API_URL` environment variable in your Lovable project

**Interactive API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Section 2 — Authentication Flow

### Registration

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "username": "alice",
  "password": "secret123",
  "role": "operator"
}
```
or
```json
{
  "username": "bob",
  "password": "secret123",
  "role": "manager"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "operator",
  "username": "alice",
  "user": {
    "id": 1,
    "username": "alice",
    "role": "operator",
    "created_at": "2024-01-15T10:30:00"
  }
}
```

**Important Note:** When registering with `role: "manager"`, the backend normalizes this to `"admin"` in the response. Your UI should:
- Display "Manager" to users
- Compare against `role === "admin"` in code

### Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "username": "alice",
  "password": "secret123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "operator",
  "username": "alice"
}
```

**Client Storage:**
Store these values in `localStorage`:
- `token` → the `access_token` value
- `role` → the `role` value ("operator" or "admin")
- `username` → the `username` value

**Protected Request Headers:**
All authenticated endpoints require:
```
Authorization: Bearer <access_token>
```

### Get Current User

**Endpoint:** `GET /api/v1/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "alice",
  "role": "operator",
  "created_at": "2024-01-15T10:30:00"
}
```

---

## Section 3 — Asset Endpoints

All asset endpoints require authentication. Role requirements are specified for each endpoint.

### 1. Create Asset (Admin Only)

**Endpoint:** `POST /api/v1/assets`  
**Role Required:** `admin`

**Request Body:**
```json
{
  "name": "Laptop Dell XPS 15",
  "type": "Electronics",
  "location": "Building A, Floor 3",
  "status": "Registered"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Laptop Dell XPS 15",
  "type": "Electronics",
  "location": "Building A, Floor 3",
  "status": "Registered",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/assets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop Dell XPS 15","type":"Electronics","location":"Building A, Floor 3","status":"Registered"}'
```

**Fetch Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:8000/api/v1/assets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Laptop Dell XPS 15',
    type: 'Electronics',
    location: 'Building A, Floor 3',
    status: 'Registered'
  })
});
const data = await response.json();
```

### 2. Get All Assets (Admin Only)

**Endpoint:** `GET /api/v1/assets`  
**Role Required:** `admin`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Laptop Dell XPS 15",
    "type": "Electronics",
    "location": "Building A, Floor 3",
    "status": "In Warehouse",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T11:00:00"
  },
  {
    "id": 2,
    "name": "Office Chair",
    "type": "Furniture",
    "location": "Warehouse",
    "status": "Registered",
    "created_at": "2024-01-15T10:45:00",
    "updated_at": "2024-01-15T10:45:00"
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/v1/assets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Fetch Example:**
```javascript
const response = await fetch('http://localhost:8000/api/v1/assets', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
const assets = await response.json();
```

### 3. Get Asset by ID (Operator & Admin)

**Endpoint:** `GET /api/v1/assets/{asset_id}`  
**Role Required:** `operator` or `admin`

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Laptop Dell XPS 15",
  "type": "Electronics",
  "location": "Building A, Floor 3",
  "status": "In Warehouse",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T11:00:00"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/v1/assets/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Update Asset Status (Operator & Admin)

**Endpoint:** `PATCH /api/v1/assets/{asset_id}/status`  
**Role Required:** `operator` or `admin`

**Request Body:**
```json
{
  "status": "In Transit"
}
```

**Allowed Status Values:**
- `Registered`
- `In Warehouse`
- `In Transit`
- `Delivered`
- `Under Maintenance`
- `Decommissioned`
- `Damaged`

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Laptop Dell XPS 15",
  "type": "Electronics",
  "location": "Building A, Floor 3",
  "status": "In Transit",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T11:15:00"
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:8000/api/v1/assets/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"In Transit"}'
```

**Fetch Example:**
```javascript
const response = await fetch(`http://localhost:8000/api/v1/assets/1/status`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: 'In Transit' })
});
const updatedAsset = await response.json();
```

### 5. Update Asset (Admin Only)

**Endpoint:** `PUT /api/v1/assets/{asset_id}`  
**Role Required:** `admin`

**Request Body:**
```json
{
  "name": "Laptop Dell XPS 15 (Updated)",
  "type": "Electronics",
  "location": "Building B, Floor 1",
  "status": "In Warehouse"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Laptop Dell XPS 15 (Updated)",
  "type": "Electronics",
  "location": "Building B, Floor 1",
  "status": "In Warehouse",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T11:30:00"
}
```

### 6. Delete Asset (Admin Only)

**Endpoint:** `DELETE /api/v1/assets/{asset_id}`  
**Role Required:** `admin`

**Response (200 OK):**
```json
{
  "message": "Asset deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:8000/api/v1/assets/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Section 4 — WebSocket

**WebSocket URL:**
```
ws://localhost:8000/api/v1/ws/dashboard?token=<JWT>
```

**For HTTPS/Production:**
```
wss://your-backend-domain.com/api/v1/ws/dashboard?token=<JWT>
```

**Role Required:** `admin` (manager) only

**Connection:**
Pass the JWT token as a query parameter. The server validates the token and checks for admin role.

**Heartbeat Protocol:**
- **Client sends:** `"ping"` (string)
- **Server responds:** `"pong"` (string)

**Event Broadcasting:**
The server broadcasts JSON events for real-time dashboard updates:

**Event: Asset Created**
```json
{
  "event": "asset_created",
  "data": {
    "id": 3,
    "name": "Monitor Samsung 27\"",
    "type": "Electronics",
    "location": "Warehouse",
    "status": "Registered",
    "created_at": "2024-01-15T12:00:00",
    "updated_at": "2024-01-15T12:00:00"
  }
}
```

**Event: Status Updated**
```json
{
  "event": "status_update",
  "data": {
    "id": 1,
    "name": "Laptop Dell XPS 15",
    "type": "Electronics",
    "location": "Building A, Floor 3",
    "status": "Delivered",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T12:15:00"
  }
}
```

**Event: Asset Deleted**
```json
{
  "event": "asset_deleted",
  "data": {
    "id": 2
  }
}
```

**React useEffect Example:**
```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Derive WebSocket URL from API base
  const wsProtocol = apiBase.startsWith('https') ? 'wss' : 'ws';
  const wsBase = apiBase.replace(/^https?/, wsProtocol);
  const wsUrl = `${wsBase}/api/v1/ws/dashboard?token=${token}`;
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    // Send periodic pings
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 30000); // every 30 seconds
    
    // Store interval ID to clear on close
    ws.pingInterval = pingInterval;
  };
  
  ws.onmessage = (event) => {
    if (event.data === 'pong') {
      console.log('Received pong');
      return;
    }
    
    try {
      const message = JSON.parse(event.data);
      
      switch (message.event) {
        case 'asset_created':
          // Add new asset to state
          setAssets(prev => [...prev, message.data]);
          break;
        case 'status_update':
          // Update asset in state
          setAssets(prev => prev.map(asset => 
            asset.id === message.data.id ? message.data : asset
          ));
          break;
        case 'asset_deleted':
          // Remove asset from state
          setAssets(prev => prev.filter(asset => asset.id !== message.data.id));
          break;
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    if (ws.pingInterval) {
      clearInterval(ws.pingInterval);
    }
  };
  
  // Cleanup on unmount
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    if (ws.pingInterval) {
      clearInterval(ws.pingInterval);
    }
  };
}, []);
```

---

## Section 5 — Role-Based UI

The backend supports two roles with specific permissions:

### Operator Role

**Role Value:** `"operator"`  
**Registration:** Use `"role": "operator"` in registration request

**Permissions:**
- Look up assets by ID (`GET /api/v1/assets/{id}`)
- Update asset status (`PATCH /api/v1/assets/{id}/status`)
- View their own profile (`GET /api/v1/auth/me`)

**UI Pages:**
- Operator Dashboard: Asset lookup form + status update form

### Admin Role (Manager)

**Role Value:** `"admin"` (normalized from `"manager"`)  
**Registration:** Use `"role": "manager"` in registration request (backend converts to "admin")

**Permissions:**
- All operator permissions
- Create new assets (`POST /api/v1/assets`)
- View all assets (`GET /api/v1/assets`)
- Update entire asset record (`PUT /api/v1/assets/{id}`)
- Delete assets (`DELETE /api/v1/assets/{id}`)
- Connect to WebSocket dashboard for real-time updates

**UI Pages:**
- Manager Dashboard: Asset table with real-time updates
- Asset creation form
- Audit panel (tracks all actions)

**Important Role Normalization:**
When users register with `role: "manager"`, the backend stores and returns `role: "admin"`. Your frontend must:
- Display "Manager" label to users
- Use `role === "admin"` in conditional logic
- Example:
  ```javascript
  const isManager = localStorage.getItem('role') === 'admin';
  const roleLabel = isManager ? 'Manager' : 'Operator';
  ```

---

## Section 6 — Lovable-Specific Configuration

### Environment Variables

In your Lovable project settings, add the following environment variable:

**Variable Name:** `VITE_API_URL`  
**Value (local dev):** `http://localhost:8000`  
**Value (production):** `https://your-backend-domain.com`

### WebSocket URL Derivation

The WebSocket URL is automatically derived from `VITE_API_URL`:
- If `VITE_API_URL` starts with `https://`, use `wss://`
- If `VITE_API_URL` starts with `http://`, use `ws://`

**Example:**
```javascript
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const wsProtocol = apiBase.startsWith('https') ? 'wss' : 'ws';
const wsBase = apiBase.replace(/^https?/, wsProtocol);
```

### CORS Configuration

The backend is configured to accept requests from:
- `https://*.lovableproject.com` (Lovable preview domains)
- `https://*.lovable.app` (Lovable app domains)
- `http://localhost:*` (local development)
- `https://localhost:*` (local HTTPS development)

If you deploy to a custom production domain, you may need to add it to the backend's `allow_origins` list in `backend/main.py`.

---

## Section 7 — Error Handling

### HTTP Status Codes

**401 Unauthorized**
- **Meaning:** Token is missing, invalid, or expired
- **Action:** Clear `localStorage`, redirect user to login page
```javascript
if (response.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
  window.location.href = '/login';
}
```

**403 Forbidden**
- **Meaning:** User is authenticated but lacks permission (e.g., operator trying to create asset)
- **Action:** Show error message: "You don't have permission to perform this action"

**400 Bad Request**
- **Meaning:** Invalid request data (e.g., missing required field)
- **Response Body:**
  ```json
  {
    "detail": "Username already exists"
  }
  ```
- **Action:** Display the `detail` message to the user

**422 Unprocessable Entity**
- **Meaning:** Validation error (e.g., password too short, invalid status value)
- **Response Body:**
  ```json
  {
    "detail": [
      {
        "loc": ["body", "password"],
        "msg": "ensure this value has at least 6 characters",
        "type": "value_error.any_str.min_length"
      }
    ]
  }
  ```
- **Action:** Map field errors to form fields and display validation messages

**404 Not Found**
- **Meaning:** Asset with given ID does not exist
- **Action:** Show message: "Asset not found"

**500 Internal Server Error**
- **Meaning:** Server-side error
- **Action:** Show generic error message and log to console for debugging

### Error Handling Example

```javascript
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 422) {
        // Validation error
        const fieldErrors = errorData.detail.map(err => 
          `${err.loc[err.loc.length - 1]}: ${err.msg}`
        ).join(', ');
        throw new Error(fieldErrors);
      }
      
      throw new Error(errorData.detail || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

---

## Section 8 — CORS Notes

### Allowed Origins

The backend is configured with the following CORS policy:

**Allow Origins (Explicit List):**
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Docker/Nginx frontend)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:3000`
- `http://localhost`
- `http://127.0.0.1`
- `https://*.lovableproject.com` (Lovable preview)
- `https://*.lovable.app` (Lovable app)
- `http://localhost:8080`
- `https://localhost:8080`

**Allow Origin Regex:**
```regex
https?://(localhost|127\.0\.0\.1)(:\d+)?|https://[\w-]+\.lovableproject\.com|https://[\w-]+\.lovable\.app
```

**Credentials:** Allowed (for JWT tokens)  
**Methods:** All (`*`)  
**Headers:** All (`*`)

### Production Deployment

For production deployment to a custom domain (not Lovable preview):

1. Open `backend/main.py`
2. Add your production origin to the `allow_origins` list:
   ```python
   allow_origins=[
       # ... existing origins ...
       "https://your-production-domain.com",
   ]
   ```
3. Redeploy the backend

### Testing CORS

Use browser DevTools → Network tab to inspect CORS headers:
- **Request Headers:** Should include `Origin: https://your-lovable-domain.com`
- **Response Headers:** Should include `Access-Control-Allow-Origin: https://your-lovable-domain.com` or the matched origin

If CORS errors occur, check:
1. Backend CORS configuration includes your frontend's origin
2. Requests include `credentials: 'include'` if using cookies (not needed for JWT in Authorization header)
3. Preflight OPTIONS requests return 200 OK

---

## Section 9 — Running Locally

### Step-by-Step Local Setup

#### 1. Start Backend with Docker Compose

```bash
cd "d:\workflow API"
docker-compose up --build
```

This starts:
- **Backend:** `http://localhost:8000`
- **PostgreSQL Database:** `localhost:5432`
- **Frontend (optional):** `http://localhost:3000`

#### 2. Verify Backend is Running

Open your browser and navigate to:
- **API Health Check:** [http://localhost:8000/](http://localhost:8000/)
  - Should return: `{"status": "healthy", "service": "Asset Tracking API", "version": "1.0.0"}`
- **Interactive API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

#### 3. Configure Lovable Frontend

In your Lovable project settings, set:
```
VITE_API_URL=http://localhost:8000
```

**Note:** For local development, you may need to use a tunneling service like ngrok if Lovable's preview environment cannot reach `localhost:8000`. See the "Using ngrok for Local Testing" section below.

#### 4. Test Registration Flow

Using the Lovable frontend:
1. Navigate to the registration page
2. Create an operator account:
   - Username: `testoperator`
   - Password: `password123`
   - Role: Operator
3. Create a manager account:
   - Username: `testmanager`
   - Password: `password123`
   - Role: Manager

#### 5. Test Login Flow

1. Login as operator → should redirect to Operator Dashboard
2. Login as manager → should redirect to Manager Dashboard
3. Verify JWT token is stored in `localStorage` (DevTools → Application → Local Storage)

#### 6. Test Asset Operations

**As Operator:**
- Use asset lookup to find an asset by ID
- Update asset status

**As Manager:**
- View asset table with real-time updates
- Create a new asset
- Edit an existing asset
- Delete an asset
- Verify WebSocket updates appear in real-time

### Using ngrok for Local Testing

If Lovable preview cannot reach `localhost:8000`, use ngrok:

1. Install ngrok: [https://ngrok.com/download](https://ngrok.com/download)
2. Start ngrok tunnel:
   ```bash
   ngrok http 8000
   ```
3. Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok.io`)
4. Set in Lovable project:
   ```
   VITE_API_URL=https://abc123.ngrok.io
   ```
5. Test the integration

**Important:** ngrok URLs change each time you restart ngrok (unless you have a paid account with reserved domains).

### Stopping the Backend

Press `Ctrl+C` in the terminal running `docker-compose`, then:
```bash
docker-compose down
```

To remove volumes (reset database):
```bash
docker-compose down -v
```

---

## Troubleshooting

### CORS Errors

**Symptom:** Browser console shows "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions:**
1. Verify `VITE_API_URL` is correctly set in Lovable project settings
2. Check backend logs for incoming requests
3. Ensure your Lovable domain matches the regex pattern in `backend/main.py`
4. For custom domains, add them explicitly to `allow_origins` list

### WebSocket Connection Failures

**Symptom:** WebSocket fails to connect or immediately disconnects

**Solutions:**
1. Verify protocol: `ws://` for HTTP, `wss://` for HTTPS
2. Check token is passed as query parameter: `?token=<JWT>`
3. Ensure user has `admin` role (operators cannot connect)
4. Check browser console for WebSocket error messages
5. Verify backend WebSocket endpoint is accessible (some hosting providers require special configuration for WebSocket)

### 401 Unauthorized After Login

**Symptom:** Login succeeds but subsequent requests return 401

**Solutions:**
1. Check `localStorage` contains `token` key
2. Verify `Authorization` header is sent: `Bearer <token>`
3. Ensure token hasn't expired (JWT expires after 24 hours by default)
4. Try logging out and logging back in

### 403 Forbidden

**Symptom:** Request returns 403 even with valid token

**Solutions:**
1. Check user role in `localStorage`
2. Verify the endpoint allows your role:
   - Operators: Cannot access `GET /api/v1/assets`, `POST /api/v1/assets`, `PUT /api/v1/assets/{id}`, `DELETE /api/v1/assets/{id}`, WebSocket
   - Admins: Can access all endpoints
3. If registered as "manager", ensure code checks for `role === "admin"`

### Invalid Status Value

**Symptom:** Status update returns 422 validation error

**Solution:** Use only these exact status values:
- `Registered`
- `In Warehouse`
- `In Transit`
- `Delivered`
- `Under Maintenance`
- `Decommissioned`
- `Damaged`

### Database Connection Errors

**Symptom:** Backend logs show "Failed to initialize database"

**Solutions:**
1. Ensure PostgreSQL container is running: `docker ps`
2. Check database credentials in `docker-compose.yml` match `backend/config.py`
3. Wait a few seconds for PostgreSQL to fully start (backend retries 5 times with 2-second delays)
4. Restart Docker Compose: `docker-compose down && docker-compose up --build`

---

## Quick Reference

### Environment Variables (Lovable)
```
VITE_API_URL=http://localhost:8000
```

### LocalStorage Keys
```javascript
localStorage.getItem('token')      // JWT token
localStorage.getItem('role')       // "operator" or "admin"
localStorage.getItem('username')   // username string
```

### Common API Calls

**Login:**
```javascript
POST /api/v1/auth/login
Body: { username, password }
Returns: { access_token, role, username }
```

**Get All Assets (Admin):**
```javascript
GET /api/v1/assets
Headers: { Authorization: `Bearer ${token}` }
Returns: Asset[]
```

**Update Status (Operator/Admin):**
```javascript
PATCH /api/v1/assets/{id}/status
Headers: { Authorization: `Bearer ${token}` }
Body: { status: "In Transit" }
Returns: Asset
```

**WebSocket (Admin):**
```javascript
ws://localhost:8000/api/v1/ws/dashboard?token=${token}
```

---

## Support

For backend-related issues:
1. Check backend logs: `docker logs <container_name>`
2. Test endpoints using Swagger UI: `http://localhost:8000/docs`
3. Verify database state using psql: `docker exec -it <postgres_container> psql -U postgres -d asset_tracking`

For frontend-related issues:
1. Check browser console for errors
2. Inspect Network tab for failed requests
3. Verify environment variables in Lovable project settings
