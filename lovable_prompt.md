# 🚀 Lovable AI Prompt — FleetTrack OS Frontend

> **Copy everything below this line and paste it into Lovable AI as your prompt.**

---

## Prompt for Lovable AI

Build a **premium, human-crafted React + Vite** single-page application called **"FleetTrack OS"** — a real-time asset tracking and freight dispatch dashboard. The design should look like it was hand-designed by a senior product designer at a top-tier logistics SaaS company, NOT like an AI-generated template. Think Linear, Vercel Dashboard, or Stripe Dashboard level polish.

### ⚠️ CRITICAL TECH STACK (DO NOT CHANGE)

- **React 19** with **Vite** as the build tool
- **React Router DOM v7** for client-side routing (`react-router-dom`)
- **Vanilla CSS only** — NO TailwindCSS, NO CSS-in-JS, NO styled-components
- **No component libraries** — no shadcn/ui, no MUI, no Chakra, no Ant Design
- All CSS must go into a single `src/index.css` file
- Use Google Fonts: **Inter** (primary body text) and **JetBrains Mono** (serial numbers / code)
- **No TypeScript** — use `.jsx` files only

### 📁 EXACT FILE STRUCTURE (Must follow precisely)

```
src/
├── main.jsx                     # ReactDOM.createRoot, renders <App />
├── App.jsx                      # BrowserRouter + AuthProvider + Routes
├── index.css                    # ALL global styles (design system + components)
├── api.js                       # API helper functions (see contract below)
├── context/
│   └── AuthContext.jsx          # Auth state: token, role, username in localStorage
├── pages/
│   ├── LoginPage.jsx            # Split-screen login/register page
│   ├── OperatorDashboard.jsx    # Scanner terminal for warehouse operators
│   └── ManagerDashboard.jsx     # Live operations center for managers
└── components/
    ├── AssetTable.jsx           # Data table with flash animation on update
    ├── AuditPanel.jsx           # Slide-in side panel showing audit history
    ├── StatusBadge.jsx          # Color-coded status pill with subtle pulse
    └── LiveIndicator.jsx        # WebSocket connection status dot
```

---

### 🔌 BACKEND API CONTRACT (The backend already exists — match these EXACTLY)

The backend runs on `http://localhost:8000`. The frontend should use `import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'` as the base URL.

#### Authentication

**POST `/api/v1/auth/login`**
- Request body: `{ "username": string, "password": string }`
- Response: `{ "access_token": string, "token_type": "bearer", "role": "admin" | "operator", "username": string }`

**POST `/api/v1/auth/register`**
- Request body: `{ "username": string, "password": string, "role": "operator" | "manager" }`
- Response: `{ "message": string, "access_token": string, "token_type": "bearer", "role": string, "username": string, "user": { "id": int, "username": string, "role": string, "created_at": string } }`

**GET `/api/v1/auth/me`** (JWT required)
- Returns current user profile

#### Assets (All require JWT in `Authorization: Bearer <token>` header)

**GET `/api/v1/assets`** (admin only) → Array of assets
**GET `/api/v1/assets/{id}`** (admin only) → Asset with `audit_logs` array
**GET `/api/v1/assets/lookup/{serial_number}`** (any role) → Single asset
**POST `/api/v1/assets`** (admin only) → Create asset: `{ "name": string, "serial_number": string, "location": string }`
**PUT `/api/v1/assets/{id}/status`** (any role) → `{ "new_status": string, "location": string | null }`
**DELETE `/api/v1/assets/{id}`** (admin only)

Asset response shape:
```json
{
  "id": 1,
  "name": "Pallet A-001",
  "serial_number": "SN-9982",
  "status": "In Transit",
  "location": "Highway I-95",
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-02T12:00:00"
}
```

Audit log shape:
```json
{
  "id": 1,
  "asset_id": 1,
  "action": "STATUS_UPDATE",
  "old_status": "In Warehouse",
  "new_status": "In Transit",
  "old_location": "Warehouse A",
  "new_location": "Truck #42",
  "changed_by": "admin",
  "changed_at": "2025-01-02T12:00:00"
}
```

#### WebSocket

**WS `/api/v1/ws/dashboard?token=<JWT>`** (admin only)

Events received:
```json
{ "event": "status_update", "asset_id": 1, "name": "...", "serial_number": "...", "old_status": "...", "new_status": "...", "location": "...", "updated_by": "..." }
{ "event": "asset_created", "asset_id": 2, "name": "...", "serial_number": "...", "status": "Registered", "location": "...", "updated_by": "..." }
{ "event": "asset_deleted", "asset_id": 1, "deleted_by": "..." }
```

Status values: `"Registered"`, `"In Warehouse"`, `"In Transit"`, `"Delivered"`, `"Under Maintenance"`, `"Damaged"`, `"Decommissioned"`

---

### 🎨 DESIGN REQUIREMENTS — MAKE IT LOOK HUMAN-MADE

#### Overall Theme
- **Premium dark mode** with deep navy/charcoal backgrounds (`#0a0e1a`, `#111827`, `#1a1f36`)
- **Glassmorphism** — `backdrop-filter: blur(20px)` on cards with semi-transparent backgrounds like `rgba(255,255,255,0.04)`
- **Accent colors**: Electric blue `#3b82f6`, vibrant green `#10b981`, warm amber `#f59e0b`, soft red `#ef4444`, purple `#8b5cf6`
- **Animated gradient background** — slow-moving radial gradients with 20-second CSS animation cycle behind all pages
- **Subtle border glow** — cards have `border: 1px solid rgba(255,255,255,0.06)` and on hover, border brightens
- Use `box-shadow` extensively for depth: inner glows, layered shadows, NOT flat design
- All text should have proper hierarchy: `#f8fafc` for primary, `#94a3b8` for secondary, `#64748b` for muted

#### Typography
- Body: `'Inter', -apple-system, sans-serif` at 15px base
- Serial numbers and code: `'JetBrains Mono', monospace`
- Headings: 700 weight, tight letter-spacing (`-0.02em`)
- Labels and hints: uppercase, 11px, 600 weight, `letter-spacing: 1px`

#### Micro-animations (make it feel ALIVE)
- **Page transitions**: Fade-in with subtle translateY (20px → 0) on mount
- **Button hover**: Scale 1.02, lighten background, smooth 200ms transition
- **Button loading**: Spinning circle animation inside the button
- **Input focus**: Border color transition to accent blue with a subtle glow ring
- **Row flash**: When a WebSocket update arrives, the affected table row flashes bright yellow for 2 seconds via CSS keyframe
- **Audit panel**: Slides in from the right edge with a smooth 300ms transform
- **Success overlay**: Full-screen green overlay that scales in from center with 400ms spring animation
- **Status badges**: Gentle pulse animation on the dot indicator
- **Stat cards**: Counter animation (number counts up from 0 on load)

---

### 📄 PAGE SPECIFICATIONS

#### 1. LoginPage (`/`)

**Split-screen layout**: Left half = white/light form panel, Right half = hero image with dark overlay.

**Left Side (Form Panel):**
- Brand badge at top: truck emoji 🚛 + "FleetTrack OS" + subtitle "Asset & Freight Tracking"
- Headline that changes: "Welcome back" for login, "Create an account" for register
- Segmented pill-style tab switcher: `Sign In` / `Create Account` (active tab has solid background, inactive is transparent)
- Role selection: Two clickable cards side by side:
  - **Operator card**: 📦 emoji, "Operator", description "Scan barcodes, check-in parcels & update shipment status", checkmark when selected
  - **Manager card**: 📊 emoji, "Manager", description "Fleet overview, audit logs & real-time transport monitoring", checkmark when selected
  - Selected card has blue border + light blue background tint
- Form fields with leading SVG icons (user icon for username, lock icon for password):
  - Inputs have `border: 1px solid #e2e8f0`, rounded corners `10px`, `padding: 12px 16px 12px 44px`
  - On focus: border becomes `#3b82f6` with `box-shadow: 0 0 0 3px rgba(59,130,246,0.1)`
- Show/hide password toggle button (eye icon SVG)
- Remember me checkbox + "Forgot password?" link
- Primary submit button: full-width, gradient blue (`#3b82f6` → `#2563eb`), rounded `12px`, white text, 600 weight
  - Shows spinner + "Signing in..." when loading
  - Text changes based on role: "Sign In as Manager" or "Sign In as Operator"
- **Quick Demo section**: Card with ⚡ icon, title "Quick Demo — 1-Click Autofill", two pill buttons:
  - "📊 Manager" → autofills `admin` / `admin123`
  - "📦 Operator" → autofills `operator` / `operator123`
- Trust footer: shield icon + "Encrypted with bcrypt & 256-bit JWT authentication"

**Register mode** additionally shows:
- "Choose a username" field with hint "Must be at least 3 characters"
- Password field with hint "6+ characters"
- Confirm password field with check icon
- Validation: passwords must match, username ≥ 3 chars, password ≥ 6 chars
- On success: show green alert "Welcome to FleetTrack! Account created as [role]. Redirecting..." then navigate after 750ms

**Right Side (Hero Panel):**
- Full-bleed background image of a transport truck (use a stock logistics/truck image or a solid deep blue gradient with grid pattern as fallback)
- Dark gradient overlay from bottom
- Top-left floating pill: pulsing green dot + "Fleet Operations Online • 14 Regional Hubs"
- Bottom-left content card (glassmorphic):
  - Badge: "FREIGHT DISPATCH & SCANNING"
  - Title: "Precision Tracking for Every Mile & Checkpoint."
  - Subtitle about real-time sync
  - 3-column metrics grid: "450+" Active Trucks, "99.8%" On-Time Handoff, "18.4K" Daily Scans
  - Testimonial quote with author avatar (initials circle), name, and role

**Error/success alerts**: Rounded cards with icon + text, red background tint for errors, green for success.

#### 2. OperatorDashboard (`/operator`)

- Protected route: requires authentication, role must be `operator`
- **Header navbar**: FleetTrack OS brand + "Warehouse Scanner Terminal" subtitle | right side: user badge showing username with "Floor Tech" role tag + Sign Out button
- **Animated dark gradient background** (same as login right panel)
- **Central glassmorphic card** (max-width 520px, centered):
  - 📦 icon + "Barcode & Asset Scanner" title
  - Large input field for serial number (uppercase auto-transform), placeholder "SN-1001"
  - "🔍 Look Up Asset" primary button (full-width, gradient blue)
  - Hint text: "💡 Try demo serials: SN-9982, SN-7721, or SN-4410"
- **When asset is found**, below the scanner show an asset info card:
  - Asset name (large, bold) + serial number in monospace
  - Current status badge (using `StatusBadge` component)
  - Location with 📍 pin icon
  - **Status dropdown** (`<select>`) with all 7 status options
  - **Location text input** for updating location
  - "✓ Confirm Status Update" green success button (full-width)
- **Success overlay**: Full-screen semi-transparent green overlay with scale-in animation, big ✅ icon, "Status Updated!" text, auto-dismiss after 1.8s, then clear form and refocus input

#### 3. ManagerDashboard (`/manager`)

- Protected route: requires authentication, role must be `admin` or `manager`
- **Header navbar**: FleetTrack OS brand + "Fleet Operations Center" subtitle | right side: `LiveIndicator` component, user badge with "Admin" tag, Refresh button, Sign Out button
- **Animated dark gradient background**

**Stat Cards Row** (responsive grid, 5 cards):
  - Total Assets (white number)
  - 🚚 In Transit (amber number)
  - 📦 In Warehouse (purple number — counts "In Warehouse" + "Registered" statuses)
  - ✅ Delivered (green number)
  - ⚠️ Needs Attention (red number — counts "Under Maintenance" + "Damaged")
  - Each card: glassmorphic, with large number on top, label below
  - Numbers should animate counting up from 0 on load

**Asset Data Table**:
  - Section header: "Active Shipments" + hint "Click any row to view its full audit history" + "🟢 Real-time updates active" pill
  - Table columns: ID (bold blue `#123`), Name, Serial Number (monospace), Status (badge), Location, Last Updated (muted date)
  - Rows are clickable (cursor pointer, hover highlight)
  - When WebSocket sends an update, the updated row flashes bright yellow for 2.5 seconds via CSS `@keyframes flash-yellow`
  - Loading state: spinner + "Loading fleet data..."
  - Empty state: 📭 icon + "No assets registered yet."

**Audit Side Panel** (when a table row is clicked):
  - Dark overlay backdrop
  - Panel slides in from the right edge (400px wide on desktop)
  - Header: asset name + serial number + ✕ close button
  - "Current Status" section: status badge + location
  - "Audit History (N events)" header
  - Timeline list of audit entries, each showing:
    - Action name (e.g., "STATUS UPDATE", "CREATED")
    - "by **username** • Jan 5, 2025, 10:30:00 AM"
    - Change details: "Status: In Warehouse → In Transit"
    - Location change if applicable: "Location: Warehouse A → Truck #42"

**WebSocket integration**:
  - Connect to `ws://localhost:8000/api/v1/ws/dashboard?token=<JWT_FROM_LOCALSTORAGE>`
  - On `status_update` event → update the asset in the table, flash the row
  - On `asset_created` event → prepend new asset to the table, flash it
  - On `asset_deleted` event → remove asset from the table
  - Heartbeat: send `"ping"` every 30 seconds
  - Show `LiveIndicator` as green pulsing dot when connected, red when disconnected

---

### 🔧 API HELPER FILE (`src/api.js`)

Must export exactly these:

```javascript
export const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function authFetch(endpoint, options = {}) {
    // Get token from localStorage
    // Set headers: Content-Type: application/json, Authorization: Bearer <token>
    // Make fetch to API_BASE + endpoint
    // On 401 (non-auth routes): clear localStorage, redirect to /
    // Return response
}

export function createDashboardSocket(onMessage, onOpen, onClose) {
    // Build ws:// URL from API_BASE
    // Connect to /api/v1/ws/dashboard?token=<token>
    // Set up onopen (call onOpen, start 30s heartbeat ping)
    // Set up onmessage (JSON.parse, call onMessage)
    // Set up onclose (call onClose)
    // Return WebSocket instance
}
```

### 🔑 AUTH CONTEXT (`src/context/AuthContext.jsx`)

Must provide via React Context:
- `token` — stored in `localStorage.getItem('token')`
- `role` — stored in `localStorage.getItem('role')`
- `username` — stored in `localStorage.getItem('username')`
- `isAuthenticated` — `!!token`
- `login(username, password)` — POST to `/api/v1/auth/login`, store response in localStorage
- `register(username, password, role)` — POST to `/api/v1/auth/register`, store response
- `logout()` — clear all from localStorage, reset state

### 🛡️ ROUTING (`src/App.jsx`)

```
/           → LoginPage (public)
/operator   → OperatorDashboard (protected, requiredRole="operator")
/manager    → ManagerDashboard (protected, requiredRole="admin")
*           → Redirect to /
```

`ProtectedRoute` component:
- If not authenticated → redirect to `/`
- If role is "admin"/"manager" and required role is "operator" → redirect to `/manager`
- If role is "operator" and required role is "admin" → redirect to `/operator`

### 🎯 IMPORTANT NOTES

1. **Branding**: The app is called "FleetTrack OS" — use 🚛 emoji as logo everywhere
2. **The backend uses `role: "admin"` internally for managers** — when the frontend displays role, show "Manager" to the user but send "manager" in register requests (the backend normalizes it to "admin")
3. **Login page should remember the username** in `localStorage.fleet_saved_username` if "Remember me" is checked
4. **After login**: redirect based on role — admin/manager → `/manager`, operator → `/operator`
5. **After register**: show success message, wait 750ms, then redirect based on role
6. **The `lookup` endpoint uses serial number**, not ID — it's `GET /api/v1/assets/lookup/{serial_number}`
7. **Status update endpoint**: `PUT /api/v1/assets/{asset_id}/status` with body `{ "new_status": "...", "location": "..." }`
8. **Audit detail endpoint**: `GET /api/v1/assets/{asset_id}` returns asset WITH `audit_logs` array (admin only)
9. **All API calls use `Content-Type: application/json`** and JWT in `Authorization: Bearer <token>` header
10. Do NOT use any external icon library — use inline SVGs or emoji

### 🎨 CSS CLASS NAMING CONVENTION

Use these exact CSS class names for the key elements (this makes backend integration seamless):

- `.auth-split-wrapper`, `.auth-left-pane`, `.auth-right-pane` — Login layout
- `.auth-form-container`, `.auth-brand-header`, `.auth-brand-badge` — Login form
- `.mode-pill-btn`, `.mode-pill-btn.active` — Sign in / Register tabs
- `.role-card-btn`, `.role-card-btn.selected` — Role selection cards
- `.human-input`, `.human-primary-btn` — Form inputs and primary buttons
- `.human-alert`, `.human-alert-error`, `.human-alert-success` — Alert messages
- `.btn-spinner` — Loading spinner inside buttons
- `.demo-credentials-card`, `.demo-pill-btn` — Quick demo section
- `.page-header`, `.header-actions`, `.user-badge` — Navbar
- `.glass-card` — Glassmorphic card container
- `.stats-grid`, `.stat-card`, `.stat-value`, `.stat-label` — Manager stats
- `.data-table`, `.flash-yellow` — Asset data table
- `.status-badge`, `.status-registered`, `.status-in-warehouse`, `.status-in-transit`, `.status-delivered`, `.status-under-maintenance`, `.status-damaged`, `.status-decommissioned` — Status badges
- `.audit-overlay`, `.audit-panel`, `.audit-timeline`, `.audit-item` — Audit panel
- `.live-indicator`, `.live-indicator.connected`, `.live-indicator.disconnected`, `.live-dot` — WebSocket indicator
- `.operator-layout`, `.operator-main`, `.scanner-card` — Operator page
- `.manager-layout`, `.manager-main` — Manager page
- `.success-overlay`, `.success-content`, `.success-icon` — Success feedback
- `.animated-bg` — Animated gradient background layer
- `.select-field` — Styled select dropdown
- `.input-field`, `.input-large` — Styled input fields
- `.btn`, `.btn-ghost`, `.btn-success`, `.btn-lg` — Button variants
- `.role-tag`, `.role-admin`, `.role-operator` — Role tag pills
- `.table-container` — Scrollable table wrapper
- `.loading-container`, `.spinner` — Loading states
- `.close-btn` — Close button for panels

### 💡 MAKE IT FEEL HUMAN

- Add imperfect warmth: slightly rounded corners (10-14px, not a uniform 8px everywhere)
- Use emoji sparingly but effectively in headers, badges, and labels (🚛, 📦, 📊, ⚡, 💡, ✅, ⚠️, 📭)
- Add a subtle CSS `text-shadow` on hero section headings for depth
- Table row hover should have a very subtle background shift, not an aggressive highlight
- Form inputs should have comfortable padding (12-16px) and feel spacious, not cramped
- Add subtle `transition: all 0.2s ease` to almost everything interactive
- The design should breathe — generous `padding`, `gap`, and `margin` between sections
- Error messages should feel helpful, not robotic (e.g., "Please enter your username" not "Username required")
- The "Quick Demo" section should feel like a delightful discovery, not a dev afterthought

Build the COMPLETE application with all files. Every file must be fully functional. Do not leave placeholder comments or TODO items. The app should work end-to-end when connected to the backend at `http://localhost:8000`.
