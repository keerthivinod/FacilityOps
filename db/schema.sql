-- FacilityOps SQLite Schema
-- Idempotent: safe to re-run (all CREATE ... IF NOT EXISTS)

-- ============================================================
-- USERS (authentication)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                      TEXT PRIMARY KEY,
  tenant_id               TEXT,
  username                TEXT UNIQUE NOT NULL,
  email                   TEXT UNIQUE NOT NULL,
  password_hash           TEXT NOT NULL,
  name                    TEXT NOT NULL,
  role                    TEXT NOT NULL CHECK (role IN ('facility_manager','technician','management','admin')),
  initials                TEXT,
  dept                    TEXT,
  must_change_password    INTEGER NOT NULL DEFAULT 0,
  is_super_admin          INTEGER NOT NULL DEFAULT 0,
  email_verified          INTEGER NOT NULL DEFAULT 0,
  active                  INTEGER NOT NULL DEFAULT 1,
  last_login_at           TEXT,
  password_changed_at     TEXT,
  created_at              TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(LOWER(email));

-- ============================================================
-- TEAM (staff roster)
-- ============================================================
CREATE TABLE IF NOT EXISTS team (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT,
  name             TEXT NOT NULL,
  role             TEXT NOT NULL,
  level            INTEGER NOT NULL DEFAULT 1,
  phone            TEXT,
  skills           TEXT NOT NULL DEFAULT '[]',
  icon             TEXT,
  tasks_completed  INTEGER NOT NULL DEFAULT 0,
  avg_tat          INTEGER NOT NULL DEFAULT 0,
  rating           REAL NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'available'
                   CHECK (status IN ('available','busy','on-leave')),
  created_at       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ASSETS
-- ============================================================
CREATE TABLE IF NOT EXISTS assets (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT,
  code          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,
  icon          TEXT,
  location      TEXT,
  status        TEXT NOT NULL DEFAULT 'healthy'
                 CHECK (status IN ('healthy','due-soon','overdue','scheduled','upcoming')),
  last_service  TEXT,
  next_service  TEXT,
  vendor        TEXT,
  amc           INTEGER NOT NULL DEFAULT 0,
  interval_days INTEGER,
  model         TEXT,
  serial        TEXT,
  install_date  TEXT,
  warranty_end  TEXT,
  critical      INTEGER NOT NULL DEFAULT 0,
  qr            TEXT,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_assets_status   ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_critical ON assets(critical) WHERE critical = true;

-- ============================================================
-- MAINTENANCE TASKS (PPM)
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT,
  asset_id     TEXT,
  asset_label  TEXT,
  task         TEXT NOT NULL,
  assignee     TEXT,
  assignee_id  TEXT,
  due_date     TEXT,
  status       TEXT NOT NULL DEFAULT 'scheduled'
               CHECK (status IN ('overdue','due-soon','scheduled','upcoming','done')),
  frequency    TEXT,
  priority     TEXT NOT NULL DEFAULT 'medium'
               CHECK (priority IN ('critical','high','medium','low')),
  category     TEXT,
  completed_at TEXT,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_maint_due      ON maintenance_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_maint_status   ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_maint_asset    ON maintenance_tasks(asset_id);
CREATE INDEX IF NOT EXISTS idx_maint_assignee ON maintenance_tasks(assignee_id);

-- ============================================================
-- TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT,
  asset_label   TEXT,
  asset_id      TEXT,
  problem       TEXT NOT NULL,
  priority      TEXT NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('critical','high','medium','low')),
  status        TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open','in-progress','resolved','closed')),
  reported_by   TEXT,
  assignee      TEXT,
  assignee_id   TEXT,
  reported_date TEXT,
  cost          REAL,
  location      TEXT,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at    TEXT,
  resolved_at   TEXT,
  esc_level     INTEGER NOT NULL DEFAULT 0,
  esc_log       TEXT NOT NULL DEFAULT '[]',
  source        TEXT NOT NULL DEFAULT 'app'
                CHECK (source IN ('app','whatsapp','email','phone')),
  tat_minutes   INTEGER,
  category      TEXT,
  resolution    TEXT,
  updated_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created  ON tickets(created_at DESC);

-- ============================================================
-- VENDORS
-- ============================================================
CREATE TABLE IF NOT EXISTS vendors (
  id         TEXT PRIMARY KEY,
  tenant_id  TEXT,
  name       TEXT NOT NULL,
  contact    TEXT,
  phone      TEXT,
  email      TEXT,
  category   TEXT,
  amc_end    TEXT,
  amc_value  REAL,
  status     TEXT NOT NULL DEFAULT 'active'
             CHECK (status IN ('active','expiring','expired','inactive')),
  last_visit TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id         TEXT PRIMARY KEY,
  tenant_id  TEXT,
  name       TEXT NOT NULL,
  qty        REAL NOT NULL DEFAULT 0,
  min_qty    REAL NOT NULL DEFAULT 0,
  unit       TEXT,
  vendor     TEXT,
  cost       REAL,
  location   TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INCIDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS incidents (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT,
  type          TEXT NOT NULL,
  location      TEXT,
  severity      TEXT NOT NULL DEFAULT 'medium'
                CHECK (severity IN ('low','medium','high','critical')),
  description   TEXT,
  reported_by   TEXT,
  incident_date TEXT,
  status        TEXT NOT NULL DEFAULT 'investigating'
                CHECK (status IN ('investigating','resolved','closed')),
  rca           TEXT,
  preventive    TEXT,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT,
  name        TEXT NOT NULL,
  doc_type    TEXT NOT NULL,
  uploaded_at TEXT,
  expiry      TEXT,
  size_label  TEXT,
  storage_url TEXT,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id         TEXT PRIMARY KEY,
  tenant_id  TEXT,
  name       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'planned'
             CHECK (status IN ('planned','in-progress','completed','on-hold','cancelled')),
  budget     REAL,
  spent      REAL DEFAULT 0,
  start_date TEXT,
  end_date   TEXT,
  lead       TEXT,
  progress   INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  priority   TEXT NOT NULL DEFAULT 'medium'
             CHECK (priority IN ('critical','high','medium','low')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- UTILITIES (monthly readings)
-- ============================================================
CREATE TABLE IF NOT EXISTS utilities (
   id          INTEGER PRIMARY KEY AUTOINCREMENT,
   tenant_id   TEXT,
   month_key   TEXT NOT NULL,
   grid_kwh    REAL,
   solar_kwh   REAL,
   water_kl    REAL,
   diesel_l    REAL,
   recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
   UNIQUE(tenant_id, month_key)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  tenant_id  TEXT,
  user_id    TEXT,
  title      TEXT NOT NULL,
  body       TEXT,
  notif_type TEXT,
  channel    TEXT NOT NULL DEFAULT 'push',
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notif_user_read ON notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- updated_at auto-touch triggers
-- ============================================================
CREATE TRIGGER IF NOT EXISTS trg_users_touch BEFORE UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_team_touch BEFORE UPDATE ON team
BEGIN
  UPDATE team SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_assets_touch BEFORE UPDATE ON assets
BEGIN
  UPDATE assets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_maintenance_tasks_touch BEFORE UPDATE ON maintenance_tasks
BEGIN
  UPDATE maintenance_tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_tickets_touch BEFORE UPDATE ON tickets
BEGIN
  UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_vendors_touch BEFORE UPDATE ON vendors
BEGIN
  UPDATE vendors SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_inventory_touch BEFORE UPDATE ON inventory
BEGIN
  UPDATE inventory SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_incidents_touch BEFORE UPDATE ON incidents
BEGIN
  UPDATE incidents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_projects_touch BEFORE UPDATE ON projects
BEGIN
  UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
