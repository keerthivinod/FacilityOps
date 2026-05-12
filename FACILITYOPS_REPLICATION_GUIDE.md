# FacilityOps Replication Guide

This guide provides exhaustive details required to completely replicate the FacilityOps application from scratch. It outlines the technology stack, architecture, database schema, user roles, frontend modules, AI implementation, and required setup scripts.

---

## 1. Tech Stack & Architecture

FacilityOps is a production-ready, multi-tenant Software-as-a-Service (SaaS) application designed for comprehensive facility management.

### **Frontend**
*   **Framework:** Next.js 14 (App Router), React 18
*   **Styling:** Tailwind CSS (with arbitrary value support and global CSS defined in `src/app/globals.css`)
*   **Icons:** Phosphor Icons, Lucide React
*   **Charts:** Recharts
*   **PWA:** Configured as a Progressive Web App (PWA) with offline capabilities. Manifest and Service Worker registration are handled manually (e.g., `register-sw.js` loaded via Next.js `<Script>` component to avoid CORS issues).

### **Backend / API**
*   **Framework:** Netlify Functions (`/.netlify/functions/*`)
*   **Architecture:** Serverless functions proxying all database requests and third-party APIs (like OpenAI).
*   **Authentication:** Custom JWT-based authentication via `bcryptjs` and `jsonwebtoken`.

### **Database**
*   **Engine:** SQLite (using `sql.js` compiled to WebAssembly for local portability).
*   **Deployment:** The database file (`facilityops.db`) is treated as a shared state across serverless functions using `netlify/functions/lib/db.js`.

---

## 2. Database Schema (Multi-Tenant SaaS)

The application uses a multi-tenant schema where almost all operational tables include a `tenant_id` column to isolate data. The core database tables include:

### **SaaS & Core Tables**
*   **`tenants`**: Manages organizations (id, name, slug, status, plan, max_users, max_assets).
*   **`tenant_settings`**: Tenant-specific configurations (openai_api_key, ai_model, brand_color, timezone, locale).
*   **`subscriptions`**: Billing and subscription details for the tenant.
*   **`users`**: User accounts (username, email, password_hash, role, tenant_id). Includes a trigger (`trg_users_touch`) to auto-update `updated_at`.
*   **`invitations`**, **`audit_log`**, **`password_reset_tokens`**: Standard SaaS management tables.

### **Operational Tables**
*   **`team`**: Staff members (role, skills (JSON string array), tasks_completed, avg_tat, rating, status).
*   **`assets`**: Infrastructure tracking (code, name, category, status, last_service, next_service, amc, critical flag).
*   **`maintenance_tasks`**: Preventive Maintenance tasks (PPM) scheduled against assets.
*   **`tickets`**: Helpdesk/Issue tracking (problem, priority, status, assignee, tat_minutes, escalation logs).
*   **`vendors`**: External service providers (amc_end, amc_value, status).
*   **`inventory`**: Parts and stock tracking (qty, min_qty, cost, vendor).
*   **`incidents`**: Critical issue reporting (severity, rca [Root Cause Analysis], preventive measures).
*   **`documents`**: Cloud document pointers (doc_type, storage_url, expiry).
*   **`projects`**: Facility project tracking (budget, spent, progress, status).
*   **`utilities`**: Monthly usage tracking (grid_kwh, solar_kwh, water_kl, diesel_l) with unique constraints on (tenant_id, month_key).
*   **`notifications`**: User-specific alerts (title, body, channel, is_read).

> **Note:** Most operational tables have `BEFORE UPDATE` triggers to auto-update the `updated_at` column.

---

## 3. Authentication & User Roles

The app supports strict Role-Based Access Control (RBAC).

**Defined Roles:**
1.  **Platform Admin (`admin`):** Super-user managing all tenants.
2.  **Management (`management`):** View-only or high-level analytical access for an organization.
3.  **Facility Manager (`facility_manager`):** Full control over operations, tickets, and AI settings within a tenant.
4.  **Technician / Staff (`technician`):** Can view assigned tasks, update ticket statuses, and log hours/parts.
5.  **Viewer (`viewer`):** Read-only access.

Authentication verifies the user against `users.password_hash` using `bcrypt` and issues a JWT token. The `tenant_status` is checked to prevent logins for suspended tenants.

---

## 4. Frontend Modules

The frontend is a Single Page Application (SPA) style interface routed via internal states mapped to URL hashes (`/#dashboard`, `/#tickets`).

*   **DashboardModule (`Dash`):** High-level KPI view, open tickets, recent incidents, cost metrics. Includes a visual pie chart breakdown of priorities.
*   **TicketsModule (`Tkt`):** Helpdesk view with routing. Uses an `autoRoute(text)` function based on keywords (e.g., "leak" -> Plumber, "power" -> Electrician).
*   **AssetsModule (`Ast`):** Infrastructure tracking and QR code generation for quick asset tagging.
*   **MaintenanceModule (`Mnt`):** Calendar/List view for scheduled PPM (Planned Preventive Maintenance).
*   **StaffModule (`Tm`):** Tracks team performance, tasks completed, average Turnaround Time (TAT), and current availability status. Includes a smart allocation engine to determine if a task requires 2 personnel.
*   **VendorsModule (`Ven`):** AMC tracking and expiring contract alerts.
*   **InventoryModule (`Inv`):** Stock level tracking with "low stock" threshold alerts.
*   **IncidentsModule (`Inc`):** Critical incident logging requiring RCA (Root Cause Analysis).
*   **ProjectsModule (`PrjModule`):** CAPEX project tracking and budget burn rate.
*   **DocumentsModule (`DocModule`):** Compliance and manual repository.
*   **UtilitiesModule (`UtiModule`):** Energy and water consumption tracking.
*   **ReportsModule (`Rpt`):** Data export and generation.
*   **NotificationsModule (`Ntf`):** Alert center.
*   **EscalationModule (`Esc`):** SLA tracking (e.g., Level 1 -> Technician, Level 2 -> Admin if unacknowledged in 20 min).
*   **WhatsAppModule:** Simulates external ticket ingestion from WhatsApp.
*   **SettingsModule (`Stg`):** User profile management, tenant settings, and AI Brain API key configuration.

---

## 5. The AI Brain Module

The AI Brain is a central analytical feature of FacilityOps, designed to provide insights on tickets, root causes, and staff performance.

### **Architecture**
1.  **Frontend (`AIBrainModule.jsx`):**
    *   Provides suggested queries.
    *   Uses a `buildContext(P)` function to serialize all current facility data (tickets, assets, inventory, incidents) into a highly structured, plain-text prompt.
    *   Sends this context + user query to the backend endpoint.
    *   **Fallback:** If the API fails or is unconfigured, it uses `generateLocalResponse(query, P)`, a local heuristic engine to mock AI responses.

2.  **Backend (`netlify/functions/ai.js`):**
    *   Receives the prompt and securely fetches the `openai_api_key` for the specific `tenant_id` from the `tenant_settings` table.
    *   Constructs a request to `https://api.openai.com/v1/chat/completions` (Default Model: `gpt-4o-mini`).
    *   Ensures that API keys are strictly kept server-side.

3.  **Smart Priority Engine:** (Client-side heuristic backup) Evaluates ticket descriptions for keywords relating to patient/guest impact, accident risks, and critical assets to auto-assign priority scores.

---

## 6. Settings & Configurations

*   **Environment Variables:**
    *   `DATABASE_URL`: Path to the SQLite DB file (Defaults to `facilityops.db`).
    *   `OPENAI_API_KEY`: Global fallback API key.
*   **Tenant Settings:** Each tenant can securely configure their own `openai_api_key`, `ai_model`, `timezone`, `locale`, and `brand_color` via the Settings UI.

---

## 7. Setup & Scripts

To replicate the environment, the following Node.js scripts manage the database state:

1.  **Dependencies:** `npm install`
2.  **Database Migration (SaaS):**
    `node scripts/migrate-saas.js` (or `npm run db:migrate-saas`)
    *   *Action:* Creates the `facilityops.db` file, applies the schema from `db/schema.sql`, and injects the multi-tenant specific tables. Creates a demo tenant ("Vaidyagrama").
3.  **Database Seeding:**
    `node scripts/seed.js` (or `npm run db:seed`)
    *   *Action:* Populates the database with initial dummy data from `src/lib/seed-data.js` to ensure the UI is functional immediately.
    *   *Default Logins Created:*
        *   Platform Admin: `admin` / `admin`
        *   Facility Manager: `keerthi` / `facility123`
        *   Technician: `rajan` / `electrician123`
        *   Management: `management` / `admin123`
4.  **Local Server:**
    `npx netlify dev`
    *   *Action:* Spins up both the Next.js frontend and the Netlify serverless functions locally.

---

### **Pre-Deployment / Performance Directives**
*   Ensure explicit `.js` extensions are used in imports for ESM compatibility.
*   Heavy filtering in React components should be wrapped in `useMemo`.
*   Verify the Service Worker (`public/register-sw.js` and `public/sw.js`) correctly caches static assets for offline use.
