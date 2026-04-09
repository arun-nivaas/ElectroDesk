# Product Specification Document
## Proton Enterprise — Electrical Inventory Management Frontend

**Version:** 1.0  
**Date:** 2026-04-09  
**Project Path:** `a:\Data Science\Shop-price\`  
**Backend Base URL:** `http://127.0.0.1:8001/api/v1`  
**Stack:** Vanilla HTML5 · Vanilla CSS3 · Vanilla JavaScript (ES2020, no bundler)

---

## 1. Product Overview

**Proton Enterprise** (also branded internally as **Sri Arunachalam Traders — Inventory Portal**) is a client-side web application that serves as the management interface for an electrical-goods shop. It provides a role-based dashboard system where:

- **Admins** can create, read, update, and delete electrical product listings.
- **Viewers** (shop floor staff, contractors) can browse and search the current inventory in a read-only mode.

The application has no build step and requires no Node.js runtime to serve. All modules communicate through shared global objects attached to the `window` object.

---

## 2. Business Context

| Attribute | Detail |
|---|---|
| **Business Name** | Sri Arunachalam Traders |
| **Domain** | Retail electrical goods (LEDs, PVC fittings, cables, wires) |
| **Tagline** | "Precision in every connection, power in every terminal." |
| **Established** | 2026 |
| **Primary Goal** | Replace manual price-list tracking with a web-managed inventory system |
| **Secondary Goal** | Enable shop floor staff to look up current prices without edit access |

---

## 3. User Personas

### 3.1 Admin (Shop Manager / Owner)
- Full CRUD access to the product catalogue.
- Can add new items, update prices/specs, and delete discontinued products.
- Authenticated via JWT; redirected to `admin.html` on login.
- Role value stored in `localStorage` as `"admin"`.

### 3.2 Viewer (Shop-Floor Staff / Contractors)
- Read-only access to the product listing.
- Can search and paginate through products.
- No Add / Edit / Delete controls are visible.
- Authenticated via JWT; redirected to `viewer.html` on login.
- Role value stored in `localStorage` as `"viewer"`.

### 3.3 Unauthenticated Visitor
- Lands on `index.html` (Login) or `register.html`.
- Attempting to access `admin.html` or `viewer.html` directly causes an immediate client-side redirect back to `index.html`.

---

## 4. File & Module Architecture

```
Shop-price/
├── index.html          ← Login page
├── register.html       ← Account registration page
├── admin.html          ← Admin dashboard (CRUD)
├── viewer.html         ← Viewer dashboard (read-only)
│
├── css/
│   ├── base.css        ← CSS custom properties, reset, typography
│   ├── layout.css      ← App shells: split-panel auth, sidebar-main dashboard
│   ├── components.css  ← Reusable UI components (inputs, buttons, modals, alerts)
│   └── pages.css       ← Page-specific overrides (table, pagination, cards)
│
└── js/
    ├── authGuard.js    ← IIFE; executes before DOM ready to block unauthorized access
    ├── api.js          ← Centralized fetch wrapper & all HTTP calls (window.apiService)
    ├── auth.js         ← Login & register business logic (window.authService)
    ├── validation.js   ← Form validation rules & messages (window.validationService)
    ├── ui.js           ← DOM manipulation, table rendering, modal mgmt (window.uiService)
    ├── product.js      ← Product state, client-side search filter, pagination (window.productService)
    └── app.js          ← DOMContentLoaded orchestrator; event binding entry point
```

### 4.1 Module Load Order (critical)

**Auth pages (`index.html`, `register.html`):**
```
ui.js → validation.js → api.js → auth.js → app.js
```

**Dashboard pages (`admin.html`, `viewer.html`):**
```
<head> authGuard.js   ← must be first, blocks page paint on unauthorized access
<body end> api.js → ui.js → product.js → app.js
```

> **Why `authGuard.js` is in `<head>`:** It executes synchronously during HTML parsing, before any body content is rendered, to immediately redirect unauthorized users. This prevents FOUC (Flash of Unauthorized Content).

---

## 5. Design System (CSS Tokens)

Defined in `css/base.css` as CSS Custom Properties:

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#0047b3` | Buttons, active states, sidebar panel |
| `--primary-hover` | `#003380` | Button hover |
| `--bg-left` | `#0047b3` | Auth page left branding panel |
| `--bg-right` | `#f9f9fb` | Auth page right panel background |
| `--text-main` | `#111827` | Primary body text |
| `--text-muted` | `#6b7280` | Secondary/label text |
| `--text-light` | `#ffffff` | Text on dark backgrounds |
| `--border` | `#e5e7eb` | Dividers, input borders |
| `--bg-input` | `#f3f4f6` | Input field background |
| `--error` | `#ef4444` | Error states, delete button |
| `--success` | `#10b981` | Success alerts |
| `--font-family` | `'Inter', system-ui` | Global font; loaded from Google Fonts |
| `--radius-md` | `0.5rem` | Standard border radius |
| `--radius-lg` | `0.75rem` | Large border radius |
| `--transition` | `all 0.2s ease-in-out` | All hover/focus transitions |

---

## 6. Pages — Functional Specification

### 6.1 Login Page (`index.html`)

**Purpose:** Authenticate an existing user and redirect them to the appropriate dashboard.

**Layout:** Two-column split-screen (`.app-container`).
- **Left Panel (`.panel-left`):** Branding — "Proton Enterprise" header, headline, quote.
- **Right Panel (`.panel-right`):** Login form inside `.auth-wrapper`.

**Form Fields (`#login-form`):**

| Field | Element | Validation |
|---|---|---|
| Username | `input[type=text]` `#username` | Required |
| Password | `input[type=password]` `#password` | Required; toggle visibility button |

**User Flow:**
1. User fills in credentials and clicks **"Login to Terminal"**.
2. `app.js` intercepts `submit`, calls `authService.handleLogin()`.
3. Validation runs via `validationService.validateForm()`.
4. If valid: button enters loading state; `apiService.loginUser()` POSTs to `/auth/login` as `application/x-www-form-urlencoded`.
5. On success: `access_token` stored in `localStorage['auth_token']`; role extracted (see §8.1) into `localStorage['auth_role']`; after 1.5s delay redirects to `admin.html` or `viewer.html`.
6. On failure: `uiService.showGlobalError()` renders the server error message in `#global-alert`.

**Navigation:** Footer link → `register.html`.

---

### 6.2 Register Page (`register.html`)

**Purpose:** Create a new user account with a selected role.

**Layout:** Same two-column split-screen as Login.
- **Left Panel:** Features marketing copy about stock tracking for the electrical store.
- **Right Panel:** Registration form.

**Form Fields (`#register-form`):**

| Field | Element | Validation |
|---|---|---|
| Full Name | `input[type=text]` `#full_name` | Required |
| Username | `input[type=text]` `#username` | Required; min 3 characters |
| Account Role | Radio group `input[name=role]` | Must have one selected (Admin or Viewer) |
| Password | `input[type=password]` `#password` | Required; min 6 characters |

**Role Selector UI:**
- Custom card-based `.role-option` labels wrapping hidden `<input type="radio">`.
- Clicking a card visually highlights it (`selected` class) and checks its radio.
- Default pre-selected role: **Viewer**.

**User Flow:**
1. User fills form and clicks **"Register"**.
2. `authService.handleRegister()` runs validation then calls `apiService.registerUser()`.
3. API POSTs to `/auth/register?name=...&username=...&password=...&role=...` (query parameters, no request body).
4. On success: form resets, success alert shown, redirects to `index.html` after 2s.
5. On failure: error displayed in `#global-alert`.

**Navigation:** Footer link → `index.html`.

---

### 6.3 Admin Dashboard (`admin.html`)

**Purpose:** Full product management (CRUD) for authenticated admins.

**Layout:** Sidebar + Main Content (`.dashboard-container`).

#### 6.3.1 Sidebar (`.sidebar`)
- **Brand:** "Inventory Portal / Admin Access" with a briefcase icon.
- **Navigation Links:** Dashboard (inactive), Products (active).
- **Add Button:** `#add-product-btn-sidebar` — opens Add Product modal.
- **Logout Button:** `#logout-btn` — triggers `authGuard.logout()` which clears localStorage and redirects to login.

#### 6.3.2 Top Bar (`.topbar`)
- **Search Input:** `#search-products` — real-time client-side filter.
- **Notification Bell:** Icon button (visual only, no functionality currently).
- **Top Logout Button:** `#top-logout-btn` — duplicate logout trigger styled in error colour.
- **Avatar:** Generic user icon (not personalized).

#### 6.3.3 Page Header
- Breadcrumb: `"Spark & Circuit Inventory"` → `"Products Portal"`.
- **Export List Button:** Present in UI but not wired to any export logic (placeholder).
- **Add Product Button:** `#add-product-btn` — opens Add Product modal.

#### 6.3.4 Statistics Card
- `#total-product-count` — displays the live count of currently visible (filtered) products using `Intl.NumberFormat('en-US')`.
- Updates on search filter changes.

#### 6.3.5 Product Table

**Columns:**

| Column | Source Field | Notes |
|---|---|---|
| Product Name & Specs | `p.name` + `p.specification` | Two-line cell; spec as muted subtext |
| Brand | `p.brand` | Falls back to `"-"` |
| Category | `p.category` | Falls back to `"-"` |
| Unit | `p.unit` | Falls back to `"pc"` |
| Price | `p.price` | Formatted as Indian Rupee via `Intl.NumberFormat('en-IN', { currency: 'INR' })` |
| Actions | — | Edit (pencil) + Delete (trash) icon buttons |

**Edit Button (`edit-product-btn`):**
- Stores full product snapshot as URL-encoded JSON in `data-product` attribute.
- On click: decodes JSON → calls `uiService.openEditProductModal(product)`.

**Delete Button (`delete-product-btn`):**
- Stores product `id` in `data-id` and `name` in `data-name`.
- On click: calls `uiService.showConfirmDelete(id, name)` → opens delete confirmation modal.

**Empty State:** "No products found." rendered in a full-width `<td>`.  
**Loading State:** Spinner rendered in a full-width `<td>` while fetch is in-flight.

#### 6.3.6 Pagination
Rendered dynamically by `uiService.renderPagination()`:
- Shows "Showing X–Y of Z results" text.
- Prev / Next arrow buttons (disabled when at boundary).
- Page number buttons; active page highlighted.
- Ellipsis (`...`) rendered when page range is non-contiguous.
- Window of 3 pages shown around current page.
- Clicking a page number calls the `onPageChange` callback which re-slices `currentProducts`.

**Items per page:** 10 (hardcoded in `product.js`).

#### 6.3.7 Add / Edit Product Modal (`#product-modal`)

**Trigger:** "Add Product" button or edit icon on a row.

**Form Fields (`#product-form`):**

| Field | Element ID | Type | Required | Default |
|---|---|---|---|---|
| Hidden ID | `#product-id` | hidden | — | Empty (add) / product ID (edit) |
| Name | `#field-name` | text | Yes | — |
| Brand | `#field-brand` | text | No | — |
| Specification | `#field-specification` | text | No | — |
| Price | `#field-price` | number (step 0.01) | Yes | — |
| Unit | `#field-unit` | text | No | `"Piece"` |
| Category | `#field-category` | text | No | — |

**Modal Title:** Switches between `"Add Product"` and `"Edit Product"` based on whether `#product-id` is empty.

**Form Submission Logic (in `app.js`):**
1. `FormData` collected; `id` field stripped from payload before PUT/POST (avoids schema conflicts).
2. `price` explicitly parsed to `parseFloat()`.
3. If `productId` exists → `apiService.updateProduct(id, data)` (PUT).
4. If no `productId` → `apiService.addProduct(data)` (POST).
5. On success: modal closes, `productService.loadProducts()` refreshes the table.
6. On API error: error message shown inside modal via `#global-alert`.

#### 6.3.8 Delete Confirmation Modal (`#delete-confirm-modal`)

- Shows product name in `#delete-product-name`.
- **"Delete Item"** button (`#confirm-delete-btn`) — stores product `id` in `dataset.id`.
- On confirm: calls `apiService.deleteProduct(id)`, on success closes modal and refreshes table.
- Has Cancel button (`.close-modal-btn`) to dismiss without action.

---

### 6.4 Viewer Dashboard (`viewer.html`)

**Purpose:** Read-only inventory browsing for authenticated viewers.

**Layout:** Same Sidebar + Main Content as Admin, but with differences:

| Feature | Admin | Viewer |
|---|---|---|
| Add Product Button | Yes | No |
| Edit/Delete Actions Column | Yes | No |
| "READ-ONLY ACCESS" Badge | No | Yes (in sidebar nav) |
| Modals | Yes | No |
| Export CSV Button | Placeholder | Placeholder |

**Info Cards (bottom of page):**
Three static informational cards displayed below the product table:
1. **Inventory Policy** — "For bulk contractor orders, contact the floor manager."
2. **Market Trends** — "Current pricing reflects local market adjustments for copper and high-grade plastics."
3. **Sync Status** — "Shop inventory is synced with the central warehouse."

**Search & Pagination:** Identical behaviour to Admin (same `productService` module).

---

## 7. Service Layer — JavaScript Modules

### 7.1 `apiService` (`js/api.js`) — `window.apiService`

The sole HTTP communication layer. All requests go through `apiService.request()`.

**Configuration:**
```js
API_CONFIG.BASE_URL = 'http://127.0.0.1:8001/api/v1'
```

**Standard Response Envelope:**
```js
// Success
{ success: true,  data: <parsed JSON>,  error: null }

// Failure
{ success: false, data: null, error: "<error message string>" }
```

**Error Extraction Priority:**
1. `data.detail` (array) → maps `err.loc[-1]: err.msg` pairs, joined by `, ` (FastAPI validation errors).
2. `data.detail` (string) → used directly.
3. `data.detail` (object) → `JSON.stringify(data.detail)`.
4. `data.message` → used directly.
5. Fallback: `"Request failed with status <status>"`.
6. Network-level catch: `error.message || "Network error occurred. Please try again."`.

**Authentication:** Reads `localStorage['auth_token']` and attaches `Authorization: Bearer <token>` header on every request automatically.

**Endpoints:**

| Method | Function | HTTP | Path | Body / Params |
|---|---|---|---|---|
| Login | `loginUser(credentials)` | POST | `/auth/login` | `application/x-www-form-urlencoded` |
| Register | `registerUser(userData)` | POST | `/auth/register?name=&username=&password=&role=` | Query params, no body |
| List Products | `getProducts(query?)` | GET | `/products/` or `/products/?search=<q>` | — |
| Add Product | `addProduct(data)` | POST | `/products/` | JSON body |
| Update Product | `updateProduct(id, data)` | PUT | `/products/<id>` | JSON body |
| Delete Product | `deleteProduct(id)` | DELETE | `/products/<id>` | — |

---

### 7.2 `authService` (`js/auth.js`) — `window.authService`

Handles login and registration business logic.

**`handleLogin(event, formEl)`:**
- Prevents default form submit.
- Clears any existing alerts.
- Runs `validationService.validateForm()`.
- Sets button to loading state.
- Calls `apiService.loginUser()`.
- On success: stores `auth_token` → extracts `role` via 3-tier strategy (see §8.1) → stores `auth_role` → after 1500ms redirects to role-appropriate page.

**`handleRegister(event, formEl)`:**
- Validates form.
- Calls `apiService.registerUser()` with form data.
- On success: resets form, shows success alert, redirects to login after 2000ms.

---

### 7.3 `authGuard` (`js/authGuard.js`) — `window.authGuard`

An immediately-invoked function expression (IIFE) that runs during HTML parsing (loaded in `<head>`).

**Guard Logic:**

| Condition | Action |
|---|---|
| Accessing `viewer.html` or `admin.html` with no token | `window.location.replace('index.html')` |
| Accessing `viewer.html` with role != `"viewer"` | `window.location.replace('index.html')` |
| Accessing `admin.html` with role != `"admin"` | `window.location.replace('index.html')` |
| Accessing login/register page while already logged in | Redirect to `admin.html` or `viewer.html` |

**`authGuard.logout()`:**
- Removes `auth_token` and `auth_role` from `localStorage`.
- Redirects to `index.html` using `window.location.replace`.

---

### 7.4 `validationService` (`js/validation.js`) — `window.validationService`

Validates form inputs; delegates error display to `uiService`.

**Rules:**

| Rule | Implementation |
|---|---|
| `required` | `value.trim() !== ''` |
| `minLength(min)` | `value.trim().length >= min` |

**Field-Specific Rules:**

| Field Name | Rule |
|---|---|
| `username` | `minLength(3)` |
| `password` | `minLength(6)` |

**`validateField(inputEl)`:** Validates a single input, calls `uiService.setFieldError()`.

**`validateForm(formEl)`:**
- Iterates all non-radio inputs.
- Also checks that a role radio is selected on registration form.
- Returns boolean indicating overall validity.

---

### 7.5 `uiService` (`js/ui.js`) — `window.uiService`

Central DOM manipulation library. Never calls the API directly.

**Input / Field Methods:**

| Method | Description |
|---|---|
| `setFieldError(inputEl, message)` | Adds/removes `.error` class on input; shows/hides `.error-message` element |
| `togglePasswordVisibility(buttonEl)` | Finds parent `.input-wrapper`'s input, toggles type between `password`/`text`, swaps SVG icon |
| `setLoadingState(buttonEl, isLoading)` | Disables button, shows/hides `.spinner`, dims opacity |

**Alert Methods:**

| Method | Description |
|---|---|
| `showGlobalAlert(message, type)` | Creates/reuses `#global-alert`; sets `.alert-error` or `.alert-success`; prepends icon SVG |
| `hideGlobalAlert()` | Removes `.show` class from `#global-alert` |
| `showGlobalError(msg)` | Shorthand for `showGlobalAlert(msg, 'error')` |
| `showGlobalSuccess(msg)` | Shorthand for `showGlobalAlert(msg, 'success')` |

**Table Rendering Methods:**

| Method | Description |
|---|---|
| `renderProductTable(products, tbodyEl)` | Renders read-only rows (5 columns) for viewer page |
| `renderAdminTable(products, tbodyEl)` | Renders admin rows (6 columns, with edit/delete buttons) |
| `setTableLoading(tbodyEl, isLoading, colspan)` | Renders centered spinner row while data is fetching |
| `renderTotalCount(count, countEl)` | Updates count element with `Intl.NumberFormat` formatted number |

**Modal Methods:**

| Method | Description |
|---|---|
| `openModal(modalId)` | Removes `hidden`, sets `display: flex`, focuses first input after 50ms |
| `closeModal(modalId)` | Adds `hidden`, sets `display: none`; hides `#global-alert` for product-modal |
| `openAddProductModal()` | Resets form, sets title to "Add Product", clears hidden ID |
| `openEditProductModal(product)` | Populates all fields from product object, sets title to "Edit Product" |
| `showConfirmDelete(id, name)` | Sets name in confirm span and `data-id` on confirm button, opens delete modal |

**Pagination:**

`renderPagination(total, currentPage, itemsPerPage, onPageChange)`:
- Calculates total pages = `Math.ceil(total / itemsPerPage)`.
- Renders Prev / Next arrow buttons (disabled at boundaries).
- Shows a sliding window of up to 3 page numbers around current page.
- Renders `"..."` ellipsis when there are skipped page numbers.

---

### 7.6 `productService` (`js/product.js`) — `window.productService`

Manages the product data lifecycle and view state. Uses a closure (IIFE) for private state.

**Private State:**

| Variable | Type | Description |
|---|---|---|
| `masterProducts` | Array | Full product list from last API fetch |
| `currentProducts` | Array | Filtered product list (result of search) |
| `currentPage` | number | Active pagination page (1-indexed) |
| `itemsPerPage` | number | Fixed at `10` |

**`loadProducts()`:**
1. Shows table loading state.
2. Calls `apiService.getProducts()`.
3. Handles three possible API response shapes: direct Array, `{ products: [] }`, or `{ items: [] }`.
4. Assigns to `masterProducts`, calls `applySearchFilter()`.

**`applySearchFilter()`:**
- Reads `#search-products` input value.
- Filters `masterProducts` against `name`, `brand`, `category`, `specification` (case-insensitive).
- Resets `currentPage` to 1.
- Calls `renderCurrentPage()` and updates `#total-product-count`.

**`renderCurrentPage()`:**
- Slices `currentProducts` using `currentPage` and `itemsPerPage`.
- Auto-detects Admin vs Viewer context (checks for `#add-product-btn` or `admin` in pathname).
- Delegates to `uiService.renderAdminTable()` or `uiService.renderProductTable()`.
- Calls `uiService.renderPagination()` with a page-change callback.

---

### 7.7 `app.js` — Application Entry Point

Runs inside `DOMContentLoaded`. Orchestrates event binding:

1. **Password toggle buttons** — `uiService.togglePasswordVisibility()`.
2. **Role selector cards** — `uiService.selectRole()`.
3. **Input `blur`** — `validationService.validateField(input)`.
4. **Input `input` event** — clears field errors as user types.
5. **Login form** `#login-form` — `authService.handleLogin()`.
6. **Register form** `#register-form` — `authService.handleRegister()`.
7. **Dashboard init:** loads products, binds search, binds logout buttons.
8. **Admin-only bindings:** add/edit/delete product flow, close modal buttons.

---

## 8. Security Model

### 8.1 JWT Role Extraction Strategy (3-tier fallback)

When a login response is received, `authService` extracts the user role using this priority order:

1. **Direct field:** `response.data.role`
2. **Nested field:** `response.data.user.role`
3. **JWT Decode fallback:** Base64-decode the JWT payload; read `payload.role`. If absent, check if `payload.sub` contains `"admin"`.

If extraction fails entirely, role defaults to `"viewer"` (least-privileged).

### 8.2 Client-Side Route Guard

`authGuard.js` uses `window.location.pathname` to identify the current page and validates `localStorage` token + role. Unauthorized users are redirected using `window.location.replace()` (no back-button re-entry).

### 8.3 Token Storage

- **`localStorage['auth_token']`** — JWT Bearer token.
- **`localStorage['auth_role']`** — User role string (`"admin"` or `"viewer"`).
- Both cleared on logout.

> **Security Note:** Storing JWTs in `localStorage` is susceptible to XSS. This is acceptable for a local/intranet deployment but should be replaced with `httpOnly` cookies in a public-facing environment.

### 8.4 API-Level Authorization

All API calls include `Authorization: Bearer <token>`. The backend (FastAPI) enforces role-based access server-side. The frontend guard is an additional UX layer, not a security boundary.

---

## 9. Data Model

### 9.1 Product Object

```js
{
  id:            string | number,  // Unique identifier (backend-generated)
  name:          string,           // Required; e.g. "LED Bulb 9W"
  brand:         string | null,    // Optional; e.g. "Philips"
  specification: string | null,    // Optional; e.g. "9W, Cool White"
  category:      string | null,    // Optional; e.g. "Lighting"
  unit:          string,           // Default "Piece"
  price:         number            // Required; decimal float
}
```

**ID Field Compatibility:** Frontend handles three possible ID field names from the backend: `p.id`, `p._id`, `p.product_id`.

### 9.2 Auth Credentials (Login)

```
Content-Type: application/x-www-form-urlencoded
Body: username=<value>&password=<value>
```

### 9.3 Auth Registration (Register)

```
POST /auth/register?name=<name>&username=<username>&password=<password>&role=<admin|viewer>
```
Field mapping: `userData.full_name` maps to `name` parameter.

### 9.4 Login Response

```json
{
  "access_token": "<JWT>",
  "role": "admin"
}
```

---

## 10. UI Component Inventory

| Component | Class(es) | CSS File |
|---|---|---|
| Split auth container | `.app-container` | `layout.css` |
| Left branding panel | `.panel-left` | `layout.css` |
| Right auth panel | `.panel-right` | `layout.css` |
| Dashboard shell | `.dashboard-container` | `layout.css` |
| Sidebar | `.sidebar`, `.sidebar-header`, `.sidebar-footer` | `layout.css` |
| Main content area | `.main-content` | `layout.css` |
| Top bar | `.topbar` | `layout.css` |
| Form group | `.form-group` | `components.css` |
| Form label | `.form-label` | `components.css` |
| Input field | `.input-field` | `components.css` |
| Input wrapper | `.input-wrapper`, `.input-icon`, `.input-action` | `components.css` |
| Field error | `.error-message` (`.show` active) | `components.css` |
| Primary button | `.btn .btn-primary` | `components.css` |
| Loading spinner | `.spinner` (`.show` active) | `components.css` |
| Alert/notification | `.alert .alert-error` / `.alert-success` | `components.css` |
| Role selector | `.role-selector`, `.role-option` (`.selected`) | `components.css` |
| Modal overlay | `.modal-overlay` (`.hidden` to hide) | `pages.css` |
| Product data table | `.table-container`, `.data-table` | `pages.css` |
| Pagination bar | `.pagination`, `.page-controls`, `.page-btn` | `pages.css` |
| Stats card | `.stats-card` | `pages.css` |
| Info card | `.info-card`, `.info-icon` | `pages.css` |
| Avatar | `.avatar` | `pages.css` |
| Nav item | `.nav-item` (`.active`) | `layout.css` |

---

## 11. State Management

The application has no centralized state store. State is managed at the service level:

```
┌─────────────────────────────────────┐
│  productService (closure)            │
│  ├── masterProducts[]               │  ← All products from API
│  ├── currentProducts[]              │  ← Post-filter view
│  └── currentPage                    │  ← Current pagination index
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  localStorage                        │
│  ├── auth_token                      │  ← JWT
│  └── auth_role                       │  ← "admin" | "viewer"
└─────────────────────────────────────┘
```

**State Flow — Search:**
```
User types in #search-products
  → productService.handleSearch()
    → applySearchFilter()
      → filters masterProducts → currentProducts
      → currentPage = 1
      → renderCurrentPage()
        → uiService.renderAdminTable / renderProductTable (sliced page)
        → uiService.renderPagination (total = currentProducts.length)
```

**State Flow — CRUD:**
```
Admin saves / deletes
  → apiService.addProduct / updateProduct / deleteProduct
    → On success: productService.loadProducts()
      → apiService.getProducts()
        → masterProducts = fresh data
        → applySearchFilter() (reapplies current search)
          → renderCurrentPage()
```

---

## 12. Known Limitations & Future Improvements

| # | Area | Current State | Recommended Improvement |
|---|---|---|---|
| 1 | **Export functionality** | Buttons present but not wired | Implement CSV via `Blob` API from `masterProducts` |
| 2 | **Search debouncing** | Fires on every keystroke | Add 300ms debounce to `handleSearch` |
| 3 | **JWT storage** | `localStorage` (XSS-vulnerable) | Use `httpOnly` cookies for production |
| 4 | **API base URL** | Hardcoded `localhost:8001` | Introduce `config.js` with dev/prod toggle |
| 5 | **Items per page** | Hardcoded `10` | Add a per-page selector dropdown |
| 6 | **Server-side search** | Fetch-all + client filter | Wire `?search=` query param for large datasets |
| 7 | **Notification bell** | Icon only, no functionality | Implement or remove |
| 8 | **Product modal validation** | No client-side validation | Add required field validation for `name` and `price` |
| 9 | **Avatar** | Generic SVG | Display username decoded from JWT payload |
| 10 | **Responsive layout** | Desktop-only | Add media queries for sidebar collapse on mobile |

---

## 13. API Contract Summary

All endpoints relative to `http://127.0.0.1:8001/api/v1`.

| Endpoint | Method | Auth | Admin | Viewer | Description |
|---|---|---|---|---|---|
| `/auth/login` | POST | No | Yes | Yes | Authenticate user, returns JWT |
| `/auth/register` | POST | No | Yes | Yes | Create new account (query params) |
| `/products/` | GET | Yes | Yes | Yes | List all products; optional `?search=` |
| `/products/` | POST | Yes | Yes | No | Create a product |
| `/products/<id>` | PUT | Yes | Yes | No | Update a product |
| `/products/<id>` | DELETE | Yes | Yes | No | Delete a product |

---

*End of Product Specification Document*
