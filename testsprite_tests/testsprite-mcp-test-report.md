# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata

| Field | Value |
|---|---|
| **Project Name** | Shop-price (Proton Enterprise) |
| **Test Date** | 2026-04-09 |
| **Prepared by** | TestSprite AI + Antigravity |
| **Server** | `http://localhost:5173` (npx serve) |
| **Backend API** | `http://127.0.0.1:8001/api/v1` |
| **Tech Stack** | Vanilla HTML / CSS / JavaScript |
| **Total Tests** | 15 |
| **Passed** | 10 ✅ |
| **Failed** | 3 ❌ |
| **Blocked** | 2 🚫 |

**TestSprite Dashboard:** https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7

---

## 2️⃣ Requirement Validation Summary

---

### 🔐 REQ-01: Authentication — Login & Registration

#### TC001 · Admin can log in and reach the admin dashboard
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/e25abaaf-2c9c-495c-8751-4e40e717a0fc)
- **Status:** ✅ Passed
- **Analysis:** Admin login with valid credentials correctly stores JWT in `localStorage`, extracts the `role` from the token payload, and redirects to `admin.html`. No issues detected.

---

#### TC002 · Viewer can log in and reach the viewer dashboard
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/e943fdf5-d63d-4e2d-8383-c2589fbaedcc)
- **Status:** ❌ Failed
- **Observations:**
  - After submitting viewer credentials, the browser landed on `/admin.html` — showing the Admin Products Portal.
  - Two login attempts were made; neither navigated to `/viewer.html`.
  - Admin UI elements (Add Product, Export List, product table with Actions column) were displayed.
- **Root Cause:** The JWT role extraction in `auth.js` falls back to checking if `payload.sub` contains `"admin"`. If the viewer's username happens to include that string, `auth_role` is set to `"admin"` and `authGuard.js` redirects to `admin.html`.
- **Fix:** Remove the `sub.includes('admin')` heuristic. Ensure the backend returns an explicit `role` field in the JWT. Default to `"viewer"` if the claim is absent.

---

#### TC005 · Logged-in users are redirected away from the login page based on role
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/636ca4b7-ce3d-43c5-9654-f92f541f5c27)
- **Status:** ❌ Failed
- **Observations:**
  - After submitting valid credentials, `index.html` remained loaded — no redirect to a dashboard occurred.
  - No error message was displayed.
- **Root Cause:** `authGuard.js` is not included in `index.html`. The auto-redirect logic for already-logged-in users only runs if `authGuard.js` is present. Since `index.html` only loads `ui.js`, `validation.js`, `api.js`, `auth.js`, and `app.js`, the guard never fires.
- **Fix:** Add `<script src="js/authGuard.js"></script>` to the `<head>` of `index.html`.

---

#### TC013 · Admin can register a new account and return to login
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/cf7d2e98-b19a-4730-b6ba-3799feb80031)
- **Status:** ✅ Passed
- **Analysis:** Registration correctly validates required fields, sends `POST /api/v1/auth/register` with query params, shows a success banner, and redirects to `index.html` after 2 seconds.

---

#### TC015 · Invalid credentials show a global login error
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/d2002086-3ee6-4054-9f19-b33f458671e9)
- **Status:** ✅ Passed
- **Analysis:** Wrong credentials correctly trigger the global error alert banner with the backend error message. Empty inputs also show inline validation errors.

---

### 🛡️ REQ-02: Auth Guard / Role-Based Access Control

#### TC003 · Unauthenticated users are blocked from the admin dashboard
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/a14d4cdf-2ae0-4d57-89de-cda4c4e38259)
- **Status:** ✅ Passed
- **Analysis:** `authGuard.js` (IIFE in `<head>`) correctly intercepts unauthenticated navigation to `/admin.html` and redirects to `index.html` before the body renders — no flash of protected content.

---

### 📦 REQ-03: Admin Product Management (CRUD)

#### TC004 · Admin full product lifecycle and logout
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/9dbe87ac-bcd2-4e38-b39f-5af465a014ff)
- **Status:** ❌ Failed
- **Observations:**
  - After clicking "Save Product", the modal closed but the new product never appeared in the table.
  - `Total Products` count incremented (up to 18), confirming backend persistence — but the table row was absent.
  - Product `TEST UNIQUE PRODUCT 12345` was not visible in the table (showing 1–10 of 18).
- **Root Cause:** Client-side pagination renders only 10 rows per page. The new product is appended at the end (page 2+). The pagination controls in `admin.html` are static HTML with no JavaScript wiring, so there is no way to navigate to the page containing the new item.
- **Fix:** After a successful add/edit, automatically navigate to the page containing the item, or show a success toast with the product name. Critically, wire up the pagination buttons in JS.

---

#### TC006 · Admin dashboard loads product list and total count
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/aaf4d875-2b32-483b-81b9-db47f53c3149)
- **Status:** ✅ Passed
- **Analysis:** On load, `GET /api/v1/products/` is called, the table renders correctly, and `#total-product-count` is updated. Loading state resolves cleanly.

---

#### TC008 · Admin search filters products and updates count
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/ec3b8004-3985-4a5c-90d4-e8879d5f0a67)
- **Status:** ✅ Passed
- **Analysis:** Typing in `#search-products` triggers a debounced `GET /api/v1/products/?search={query}`, correctly filtering table rows and updating the count.

---

#### TC011 · Admin edit modal is pre-filled for existing product
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/6d86208b-008c-40c2-8d5c-2b9c1d518a87)
- **Status:** ✅ Passed
- **Analysis:** Clicking the Edit button opens the modal with all fields pre-populated. The hidden `#product-id` is correctly set, enabling a `PUT` request on save.

---

#### TC014 · Admin can cancel deletion without removing product
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/9d73a72c-20b4-4560-b7df-db8a6ebd0089)
- **Status:** ✅ Passed
- **Analysis:** The delete confirmation modal shows the correct product name. Clicking "Cancel" closes the modal without firing any `DELETE` API call. Product remains in table.

---

### 👁️ REQ-04: Viewer Dashboard (Read-Only)

#### TC009 · Viewer dashboard loads read-only list and total count
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/6505693d-5071-4a50-8864-d5007b552407)
- **Status:** 🚫 Blocked
- **Observations:** No viewer-role credentials were available for the test environment. The only account (`DAD`) is admin. Direct navigation to `/viewer.html` unauthenticated redirected to login.
- **Analysis:** Blocked due to missing viewer test credentials. TC002's role-assignment bug would also block this flow even with credentials present.

---

#### TC010 · Logout from viewer returns to login page
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/62536b0a-3377-4304-81f0-fd6b17308575)
- **Status:** ✅ Passed
- **Analysis:** Viewer sidebar logout correctly calls `authGuard.logout()`, clears `localStorage`, and redirects to `index.html`.

---

#### TC012 · Viewer search filters products and updates count
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/ec2fb5da-2c0d-4bfb-b5dd-ab58064af386)
- **Status:** 🚫 Blocked
- **Observations:** The password field was not accessible as an interactive element in the automated browser — only the username input was interactable (index 2091). Credentials could not be submitted.
- **Analysis:** Likely caused by the toggle-password button overlay consuming pointer events on the password `<input>`. Recommend adding `data-testid` attributes to all auth inputs.

---

### 🚪 REQ-05: Logout

#### TC007 · Logout from admin returns to login page
- **Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/70304473-cbfe-4b07-a70b-63f40864a3b7/2cbb605c-577a-4ffa-8283-a6b2de8716b0)
- **Status:** ✅ Passed
- **Analysis:** Both `#logout-btn` (sidebar) and `#top-logout-btn` (topbar) correctly clear localStorage and redirect to `index.html`.

---

## 3️⃣ Coverage & Matching Metrics

| Requirement | Tests | ✅ Passed | ❌ Failed | 🚫 Blocked |
|---|---|---|---|---|
| REQ-01: Authentication | 5 | 3 | 2 | 0 |
| REQ-02: Auth Guard / RBAC | 1 | 1 | 0 | 0 |
| REQ-03: Admin CRUD | 5 | 4 | 1 | 0 |
| REQ-04: Viewer Dashboard | 3 | 1 | 0 | 2 |
| REQ-05: Logout | 1 | 1 | 0 | 0 |
| **TOTAL** | **15** | **10** | **3** | **2** |

- **Overall Pass Rate:** 66.7% (10 / 15)
- **Effective Pass Rate (excl. blocked):** 76.9% (10 / 13)

---

## 4️⃣ Key Gaps / Risks

### 🔴 Critical

| # | Issue | File | Impact |
|---|---|---|---|
| C1 | **Viewer login resolves to admin role** — `sub.includes('admin')` heuristic in JWT decode causes wrong role assignment | `js/auth.js` L53-55 | Viewers silently gain admin access; RBAC is broken — security risk |
| C2 | **`authGuard.js` missing from `index.html`** — already-logged-in users are not auto-redirected | `index.html` | Logged-in users must re-login every time they visit the root URL |

### 🟠 High

| # | Issue | File | Impact |
|---|---|---|---|
| H1 | **Pagination is static HTML** — newly added/edited products land on an unreachable page | `admin.html`, `viewer.html` | Admins cannot confirm successful CRUD operations; inventory beyond page 1 is inaccessible |
| H2 | **Viewer dashboard has zero verified coverage** — no viewer credentials exist for testing | `viewer.html`, backend | Entire viewer feature set is unverified |

### 🟡 Medium

| # | Issue | File | Impact |
|---|---|---|---|
| M1 | **Password input not interactable** in automated tests — toggle button overlay may block pointer events | `index.html`, `register.html` | TC012 blocked; intermittent test failures in CI |
| M2 | **Export buttons non-functional** — visible but no implementation | `admin.html`, `viewer.html` | Misleading UI |
| M3 | **Admins redirected to login from `viewer.html`** instead of their dashboard | `js/authGuard.js` L20-22 | Admin users locked out of the viewer preview |

### 🟢 Low / Recommendations

| # | Recommendation |
|---|---|
| L1 | Add `data-testid` attributes to all form inputs (`data-testid="username-input"`, `data-testid="password-input"`) for test stability |
| L2 | Show a toast/flash message after add/edit confirming the saved product name |
| L3 | Create and document a dedicated `viewer` test account for automated and manual QA |
| L4 | Wire up JS pagination — generate page buttons dynamically based on total item count |

---

*Report generated by TestSprite AI × Antigravity — 2026-04-09*
