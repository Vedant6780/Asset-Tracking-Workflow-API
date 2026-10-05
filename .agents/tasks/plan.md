# Implementation Plan: Lovable Frontend Integration

## Context
The existing FastAPI backend at `d:\workflow API\backend` is fully functional with auth (register/login), asset management, WebSocket real-time updates, and PostgreSQL database support. The current frontend at `d:\workflow API\frontend` works locally with `http://localhost:8000` backend.

The user has created a Lovable-built frontend (https://lovable.dev/projects/71e2d576-ae20-4963-8e3b-f75e8547abe9) and wants to integrate it with the existing backend. Lovable projects are hosted on preview domains like `*.lovableproject.com` and require CORS configuration to communicate with the backend.

## Key Findings from Exploration

### Backend Status
- **CORS Configuration** (main.py): Currently allows only localhost origins:
  - `http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`, `http://127.0.0.1:3000`
  - Regex: `http://(localhost|127\.0\.0\.1)(:\d+)?`
  - **Does NOT include**: Lovable preview domains (`*.lovableproject.com`), HTTPS origins, or production domains
- **Auth endpoints**: Working - `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me`
- **Asset endpoints**: Working - full CRUD + status updates
- **WebSocket**: Working - `ws://host/api/v1/ws/dashboard?token=<JWT>` for admin role
- **Database**: PostgreSQL (via Docker) with asyncpg, or SQLite (for local dev)

### Frontend Status
- **Existing frontend**: React 19 + Vite 7, uses `VITE_API_URL` env var (defaults to `http://127.0.0.1:8000`)
- **API integration**: Uses `authFetch()` wrapper in `src/api.js` with JWT Bearer tokens
- **Auth flow**: Stores `token`, `role`, `username` in localStorage
- **WebSocket**: Uses `createDashboardSocket()` from `src/api.js`
- **Current frontend**: Already implements the exact design specified in `lovable_prompt.md`

### Integration Requirements
1. **CORS must allow**:
   - Lovable preview domains: `https://*.lovableproject.com`
   - Production HTTPS domains (for future deployment)
   - Keep existing localhost origins for local development
2. **Environment variables**:
   - Backend needs optional `FRONTEND_ORIGINS` env var for production CORS origins
   - Frontend (if we integrate Lovable code) needs `VITE_API_URL` and optionally `VITE_WS_URL`
3. **Lovable frontend integration**:
   - Cannot directly access Lovable project code (the URL is a web app, not a repo)
   - User needs to either: (a) export code from Lovable and provide it, or (b) deploy backend with proper CORS and give Lovable the backend URL
4. **API contract compatibility**:
   - Existing frontend already matches the backend contract
   - Lovable frontend needs to match the same contract (detailed in `lovable_prompt.md`)

## Decision: Two-Track Approach

Since we cannot access the Lovable project code directly, this plan covers **backend changes only** to enable the integration. The user will need to configure the Lovable frontend separately with the backend URL.

### Track 1: Backend CORS Configuration (Enabling Lovable Integration)
Update CORS to accept requests from Lovable preview domains and HTTPS origins, while keeping localhost for local dev.

### Track 2: Integration Documentation
Provide clear instructions for the user on how to configure the Lovable frontend to work with the backend.

---

# Implementation Plan

- [ ] 1. **Update CORS configuration in backend/main.py to support Lovable preview domains and HTTPS origins**
      
      Current CORS only allows `http://localhost:*` and `http://127.0.0.1:*`. Add support for:
      - Lovable preview domains: `https://*.lovableproject.com` (using allow_origin_regex)
      - Optional environment-based origins (for production deployment)
      - Keep existing localhost origins for local development
      - Change allow_origin_regex to support both HTTP localhost AND HTTPS Lovable domains
      
      Files:
      - `d:\workflow API\backend\main.py` (modify CORS middleware configuration)
      - `d:\workflow API\backend\config.py` (add optional FRONTEND_ORIGINS env var)
      
      Verify: 
      - Run `python -m uvicorn main:app --reload --port 8000` from backend directory
      - Check startup logs for no errors
      - Verify `http://localhost:8000/docs` loads successfully
      - Test CORS headers by making a request with `Origin: https://test.lovableproject.com` header

- [ ] 2. **Add environment variable configuration for dynamic CORS origins**
      
      Create a config system that allows production deployments to specify allowed origins via environment variable, while keeping sensible defaults for development.
      
      Implementation:
      - Add `FRONTEND_ORIGINS` environment variable to config.py (comma-separated list)
      - Parse it into a list of origins
      - Merge with default localhost origins
      - Update docker-compose.yml to show example of setting FRONTEND_ORIGINS
      
      Files:
      - `d:\workflow API\backend\config.py` (add FRONTEND_ORIGINS parsing)
      - `d:\workflow API\backend\main.py` (use parsed origins in CORS config)
      - `d:\workflow API\docker-compose.yml` (add example FRONTEND_ORIGINS env var)
      
      Verify:
      - Run `python -m uvicorn main:app --reload --port 8000` from backend directory with and without FRONTEND_ORIGINS set
      - Check that default origins work when env var is not set
      - Set `FRONTEND_ORIGINS=https://example.com,https://test.com` and verify both are allowed

- [ ] 3. **Update backend README.md with Lovable integration instructions**
      
      Add a new section explaining:
      - How to configure the backend for Lovable frontend
      - What CORS origins are now supported
      - How to set FRONTEND_ORIGINS for production
      - WebSocket URL format for HTTPS origins (`wss://` instead of `ws://`)
      
      Files:
      - `d:\workflow API\README.md` (add "Lovable Frontend Integration" section)
      
      Verify:
      - Read the updated README and ensure instructions are clear
      - Verify all mentioned files and URLs are correct

- [ ] 4. **Create Lovable integration guide document**
      
      Create a comprehensive guide that the user can follow to configure their Lovable frontend to work with this backend. Include:
      - Backend API endpoint configuration (VITE_API_URL)
      - WebSocket URL configuration (VITE_WS_URL)
      - CORS requirements and troubleshooting
      - Auth flow checklist (localStorage token management)
      - API contract reference (exact endpoint paths, request/response shapes)
      - Status values, role values ("admin" vs "manager" normalization)
      - Error handling patterns (401 handling, token expiry)
      - Example environment variables for Lovable
      
      Files:
      - `d:\workflow API\LOVABLE_INTEGRATION.md` (new file)
      
      Verify:
      - Read through the guide and ensure all API endpoints are correctly documented
      - Cross-reference with `lovable_prompt.md` to ensure contract consistency
      - Verify example values match the actual backend code

- [ ] 5. **Add HTTPS WebSocket support detection in frontend api.js**
      
      The existing frontend's `createDashboardSocket()` function needs to detect HTTPS origins and use `wss://` instead of `ws://`. This ensures the Lovable frontend (which will be served over HTTPS) can connect to the WebSocket.
      
      Implementation:
      - Update `frontend/src/api.js` WebSocket URL construction to check if API_BASE starts with `https`
      - If yes, use `wss://` protocol; otherwise use `ws://`
      - This is already partially implemented but needs verification
      
      Files:
      - `d:\workflow API\frontend\src\api.js` (verify/update createDashboardSocket function)
      
      Verify:
      - Read the file and confirm the logic handles both `http://` → `ws://` and `https://` → `wss://`
      - Test locally by setting VITE_API_URL to an https URL (even if backend isn't running) and checking console logs

- [ ] 6. **Test CORS configuration with curl commands simulating Lovable origin**
      
      Before the user attempts integration, verify CORS is working correctly by simulating requests from Lovable preview domain.
      
      Test cases:
      - OPTIONS preflight request with `Origin: https://project-abc123.lovableproject.com`
      - POST /api/v1/auth/login with Lovable origin
      - GET /api/v1/assets with Lovable origin and JWT token
      - Verify Access-Control-Allow-Origin header is present in responses
      
      Verify:
      - Run backend: `python -m uvicorn main:app --reload --port 8000` from backend directory
      - Execute curl commands (documented in LOVABLE_INTEGRATION.md)
      - Check response headers include `Access-Control-Allow-Origin: https://...lovableproject.com` or `*` depending on configuration
      - Verify no CORS errors in browser console when making cross-origin requests

- [ ] 7. **Update docker-compose.yml to support production deployment with environment variables**
      
      Ensure the Docker setup can accept environment variables for CORS origins, making it deployment-ready.
      
      Implementation:
      - Add FRONTEND_ORIGINS to backend service environment section
      - Add comments explaining how to set it for production
      - Ensure frontend build can accept VITE_API_URL at build time (already present)
      
      Files:
      - `d:\workflow API\docker-compose.yml` (add FRONTEND_ORIGINS env var with comments)
      
      Verify:
      - Run `docker-compose up --build` and verify no errors
      - Check backend logs show CORS configuration loaded correctly
      - Frontend should build with the VITE_API_URL from build args

- [ ] 8. **Create troubleshooting checklist for common integration issues**
      
      Document common issues that might occur during Lovable integration and how to resolve them:
      - CORS errors: "Access-Control-Allow-Origin" missing
      - WebSocket connection failures: wrong protocol (ws vs wss)
      - 401 Unauthorized: token not being sent or expired
      - 403 Forbidden: role-based access issues (operator trying to access admin endpoints)
      - Network errors: wrong API_BASE URL
      - Mixed content warnings: HTTP backend with HTTPS frontend
      
      Files:
      - `d:\workflow API\TROUBLESHOOTING.md` (new file)
      
      Verify:
      - Read through and ensure each issue has a clear diagnostic step and solution
      - Cross-reference with actual error messages from FastAPI and browser console

---

## Post-Implementation Steps for User

After these changes are implemented, the user needs to:

1. **Deploy the backend** to a publicly accessible server (e.g., Render, Railway, Fly.io, DigitalOcean) OR use ngrok/localtunnel for testing
2. **Configure Lovable frontend** with environment variables:
   - `VITE_API_URL=https://your-backend-domain.com` (or `http://localhost:8000` for local testing)
   - `VITE_WS_URL=wss://your-backend-domain.com/api/v1/ws/dashboard` (optional, auto-detected from VITE_API_URL)
3. **Test the integration** using the checklist in LOVABLE_INTEGRATION.md:
   - Registration flow
   - Login flow (both operator and manager roles)
   - Operator dashboard: asset lookup and status update
   - Manager dashboard: asset list, WebSocket real-time updates, audit panel
4. **Monitor CORS headers** in browser DevTools Network tab to ensure cross-origin requests succeed

## Known Limitations

1. **Lovable project code is not directly accessible**: The user must manually configure environment variables in their Lovable project
2. **Cannot test Lovable integration end-to-end**: We can only verify backend CORS configuration; actual integration testing requires Lovable deployment
3. **WebSocket over public internet**: May require additional configuration depending on hosting provider (proxy_pass settings for nginx, WebSocket support enabled)

## Success Criteria

✅ Backend accepts requests from `https://*.lovableproject.com` origins
✅ CORS configuration is environment-aware (dev vs production)
✅ Documentation clearly explains integration steps
✅ WebSocket supports both `ws://` (local) and `wss://` (production/Lovable)
✅ curl tests confirm CORS headers are correct
✅ Docker setup works with environment variables

