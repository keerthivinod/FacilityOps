-- ============================================================================
-- FacilityOps SaaS Foundation Migration (idempotent — safe to re-run)
-- Adds multi-tenancy, subscriptions, invitations, audit log, and tenant settings.
-- All schema changes use IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
-- ============================================================================

-- ─── TENANTS (customer organizations) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
   id              TEXT PRIMARY KEY,
   name            TEXT NOT NULL,
   slug            TEXT UNIQUE NOT NULL,
   status          TEXT NOT NULL DEFAULT 'trial'
                   CHECK (status IN ('trial','active','past_due','suspended','cancelled','demo')),
   plan            TEXT NOT NULL DEFAULT 'trial'
                   CHECK (plan IN ('trial','starter','pro','enterprise','demo')),
   trial_ends_at   TEXT,
   max_users       INTEGER NOT NULL DEFAULT 5,
   max_assets      INTEGER NOT NULL DEFAULT 50,
   contact_email   TEXT,
   contact_phone   TEXT,
   country         TEXT,
   created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_slug   ON tenants(LOWER(slug));

-- ─── TENANT SETTINGS (per-org configuration including AI BYOK) ──────────────
CREATE TABLE IF NOT EXISTS tenant_settings (
   tenant_id        TEXT PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
   openai_api_key   TEXT,                  -- BYOK: per-tenant OpenAI API key
   ai_model         TEXT DEFAULT 'gpt-4o-mini',
   logo_url         TEXT,
   brand_color      TEXT DEFAULT '#059669',
   timezone         TEXT DEFAULT 'Asia/Kolkata',
   locale           TEXT DEFAULT 'en-IN',
   currency         TEXT DEFAULT 'INR',
   whatsapp_number  TEXT,
   notify_email     TEXT,
   created_at       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── SUBSCRIPTIONS (Stripe billing state) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
   tenant_id              TEXT PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
   stripe_customer_id     TEXT UNIQUE,
   stripe_subscription_id TEXT UNIQUE,
   stripe_price_id        TEXT,
   status                 TEXT,            -- trialing, active, past_due, canceled, incomplete
   current_period_start   TEXT,
   current_period_end     TEXT,
   cancel_at              TEXT,
   cancelled_at           TEXT,
   seat_count             INTEGER DEFAULT 0,
   monthly_amount_inr     INTEGER,         -- billed amount in paise (₹299 = 29900)
   created_at             TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at             TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── INVITATIONS (invite-only onboarding flow) ──────────────────────────────
CREATE TABLE IF NOT EXISTS invitations (
   id           TEXT PRIMARY KEY,
   tenant_id    TEXT REFERENCES tenants(id) ON DELETE CASCADE,
   email        TEXT NOT NULL,
   role         TEXT NOT NULL DEFAULT 'member'
                CHECK (role IN ('owner','admin','manager','member')),
   token        TEXT UNIQUE NOT NULL,    -- single-use bearer token sent in invite link
   expires_at   TEXT NOT NULL,
   accepted_at  TEXT,
   invited_by   TEXT,
   created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_invitations_tenant ON invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token  ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email  ON invitations(LOWER(email));

-- ─── AUDIT LOG (who did what, when, where) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
   id              INTEGER PRIMARY KEY AUTOINCREMENT,
   tenant_id       TEXT,
   user_id         TEXT,
   action          TEXT NOT NULL,    -- e.g. 'login', 'ticket.create', 'user.invite'
   resource_type   TEXT,
   resource_id     TEXT,
   metadata        TEXT,
   ip_address      TEXT,
   user_agent      TEXT,
   created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_time ON audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_time   ON audit_log(user_id, created_at DESC);

-- ─── USERS — add SaaS columns ───────────────────────────────────────────────
-- Add columns only if they don't exist (SQLite doesn't support IF NOT EXISTS for ADD COLUMN)
-- We'll handle this in the migration script by checking

-- ─── ALL OTHER TABLES — add tenant_id column ────────────────────────────────
-- Tenant columns are already added in the main schema

-- ─── PASSWORD RESET TOKENS (forced reset / forgot password) ─────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
   token        TEXT PRIMARY KEY,
   user_id      TEXT NOT NULL,
   expires_at   TEXT NOT NULL,
   used_at      TEXT,
   created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
