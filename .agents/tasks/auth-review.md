# Authentication System Overhaul

Authentication system migration from python-jose to PyJWT, bcrypt compatibility fixes, and Pydantic v2 standardization to enable registration and login for operators and managers with encrypted PostgreSQL storage.

The core issue was dependency version conflicts: bcrypt 4.0.1 broke passlib 1.7.4's API expectations, and python-jose's stale codebase couldn't work with modern cryptography packages. Both registration and login would fail immediately. The fix pins bcrypt 4.1.3 (which restores passlib compatibility) and replaces python-jose with actively maintained PyJWT 2.8.0.

**Watch for:** Nginx SPA fallback missing for React Router in Docker production (likely — not tested in verification), SECRET_KEY defaults to demo value (acceptable for dev/test).

**Verdict**: APPROVED

## High-level view

The authentication fix is functionally complete for its stated goal: enable registration and login for operators and managers with encrypted passwords stored in PostgreSQL. PyJWT 2.8.0 replaces python-jose, bcrypt 4.1.3 restores passlib compatibility, and Pydantic v2 is pinned and used consistently. JWT decoding includes the required `algorithms` parameter. Password hashing uses bcrypt via passlib's CryptContext. Registration and login work end-to-end in both local dev mode and Docker Compose.

Role normalization treats "manager" and "admin" as equivalent. The SECRET_KEY defaults to a demo value for development, which is acceptable for local testing.

The frontend Docker image lacks a custom nginx.conf with SPA fallback rules, which means direct navigation to `/manager` or `/operator` (bookmark, refresh) will 404 in production. This doesn't block registration and login functionality — it affects post-login navigation in Docker-deployed production environments. Vite's dev server handles SPA routing automatically, so local development is unaffected.

Role normalization treats "manager" and "admin" as equivalent. The register endpoint maps both to "admin" in the database, and the `require_role()` dependency treats them as equivalent when checking permissions. Login returns the stored role from the database. The frontend handles both "admin" and "manager" in its navigation logic.

Password hashing uses passlib's CryptContext with bcrypt as the backend. The switch from bcrypt 4.0.1 to 4.1.3 restores compatibility because the 4.1.x series reverted breaking API changes from 4.0.x.

Pydantic v2 is pinned at 2.9.2, and all schema models use `model_config = ConfigDict(from_attributes=True)`. The router uses `model_validate()`, the v2 API.

Docker Compose removed the conflicting `image: postgres:16-alpine` directive, keeping only `build: ./database`. The frontend Dockerfile accepts `VITE_API_URL` as a build argument, and docker-compose.yml passes `http://localhost:8000`.

## Issues (1)

<details>
<summary>Issues (1)</summary>

1. **Nginx SPA fallback missing** (likely) — Default nginx config doesn't include `try_files $uri /index.html;` for React Router. Direct navigation to `/manager` or `/operator` will 404 in production. Add custom nginx.conf with SPA fallback rule.

</details>

<details>
<summary>Details</summary>

## Nginx SPA fallback for React Router

`frontend/Dockerfile` copies the Vite build output to `/usr/share/nginx/html` and uses the default nginx:alpine image without a custom config. The default nginx config serves `index.html` at the root, but doesn't include the `try_files` directive needed for client-side routing.

When a user navigates to `http://localhost:3000/manager` directly (bookmark, refresh, or link), nginx looks for a file at `/usr/share/nginx/html/manager` and returns 404. React Router handles routing in the browser, but the browser never loads the app because nginx rejects the initial request.

The fix is adding a custom `nginx.conf`:
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }
}
```

and copying it into the image:
```dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

This is only a production concern — Vite's dev server handles SPA routing automatically, so local development with `npm run dev` works correctly. The verification notes test login and navigation, but don't explicitly test direct navigation to `/manager` in Docker mode, so this gap wouldn't surface until production.















## Registration validation redundancy

`schemas.py` defines `RegisterRequest` with `username: str = Field(..., min_length=3, max_length=50)`. Pydantic validates this before the request reaches the router.

`auth_router.py` lines 24-29 then re-validate:
```python
username = request.username.strip()
if len(username) < 3:
    raise HTTPException(status_code=400, detail="Username must be at least 3 characters long")
```

The `.strip()` call is meaningful — it normalizes whitespace before checking the database. But the length check is redundant. Pydantic's `min_length=3` already rejects usernames shorter than 3 characters, so the custom check never triggers.

The same pattern applies to password validation: Pydantic enforces `min_length=6`, and the router re-checks it. The redundancy is harmless but adds noise.











</details>

<details>
<summary>File Map</summary>

## Changed Files

- **backend/requirements.txt** — Replaced python-jose with PyJWT 2.8.0, upgraded bcrypt to 4.1.3, pinned pydantic to 2.9.2
- **backend/auth.py** — Changed imports from `jose` to `jwt`, updated exception handling to use `InvalidTokenError`
- **backend/schemas.py** — Migrated all models to Pydantic v2 `model_config = ConfigDict(from_attributes=True)` pattern
- **backend/routers/auth_router.py** — No changes (already used correct `model_validate()` API)
- **docker-compose.yml** — Removed conflicting `image: postgres:16-alpine` from db service, added `VITE_API_URL` build arg to frontend
- **frontend/Dockerfile** — Added `ARG VITE_API_URL` and `ENV VITE_API_URL` for configurable API endpoint

Full diff available via `git diff main` (if changes are committed to a feature branch).

</details>
