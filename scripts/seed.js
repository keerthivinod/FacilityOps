#!/usr/bin/env node
// Run: node scripts/seed.js
// Seeds all 12 tables with initial production data.
// Idempotent — uses ON CONFLICT DO UPDATE so re-running is safe.

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const bcrypt = require("bcryptjs");
const initSqlJs = require("sql.js");

const {
  TEAM, DEMO_USERS, DEMO_CREDENTIALS,
  INIT_ASSETS, INIT_TASKS, INIT_TICKETS, INIT_VENDORS, INIT_INVENTORY,
  INIT_INCIDENTS, INIT_DOCS, INIT_PROJECTS, UTILITY_DATA, NOTIF_LOG,
} = require("../src/lib/seed-data");

const dbPath = process.env.DATABASE_URL || "facilityops.db";
let db;

async function initDb() {
  const SQL = await initSqlJs();
  try {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } catch (e) {
    db = new SQL.Database();
  }
}

async function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

async function run(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(params);
    stmt.free();
    return result;
  } catch (e) {
    throw e;
  }
}

async function seed() {
  await initDb();
  const defaultTenantId = "T001";
  try {

    // ─── USERS ───────────────────────────────────────────────────────────────
    console.log("Seeding users...");
    for (const u of DEMO_USERS) {
      const cred = DEMO_CREDENTIALS.find((x) => x.email === u.email);
      if (!cred) continue;
      const hash = await bcrypt.hash(cred.password, 12);
      await run(
        `INSERT OR REPLACE INTO users (id, tenant_id, username, email, password_hash, name, role, initials, dept, must_change_password, is_super_admin, email_verified, active)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [u.id, defaultTenantId, cred.username, u.email, hash, u.name, u.role, u.initials, u.dept, 0, 0, 1, 1]
      );
    }

    // ─── TEAM ────────────────────────────────────────────────────────────────
    console.log("Seeding team...");
    for (const s of TEAM) {
      await run(
        `INSERT OR REPLACE INTO team (id,tenant_id,name,role,level,phone,skills,icon,tasks_completed,avg_tat,rating,status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [s.id, defaultTenantId, s.name, s.role, s.level, s.phone, JSON.stringify(s.skills),
         s.icon, s.tasksCompleted, s.avgTAT, s.rating, s.status]
      );
    }

    // ─── ASSETS ──────────────────────────────────────────────────────────────
    console.log("Seeding assets...");
    for (const a of INIT_ASSETS) {
      await run(
        `INSERT OR REPLACE INTO assets (id,tenant_id,code,name,category,icon,location,status,last_service,next_service,
           vendor,amc,interval_days,model,serial,install_date,warranty_end,critical,qr)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [a.id, defaultTenantId, a.code, a.name, a.cat, a.icon, a.loc, a.status, a.last || null, a.next || null,
         a.vendor, a.amc ? 1 : 0, a.interval, a.model, a.serial, a.install || null, a.warranty || null,
         a.critical ? 1 : 0, a.qr]
      );
    }

    // ─── MAINTENANCE TASKS ───────────────────────────────────────────────────
    console.log("Seeding maintenance tasks...");
    for (const m of INIT_TASKS) {
      await run(
        `INSERT OR REPLACE INTO maintenance_tasks (id,tenant_id,asset_id,asset_label,task,assignee,assignee_id,
           due_date,status,frequency,priority,category)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [m.id, defaultTenantId, m.assetId, m.asset, m.task, m.assignee, m.assigneeId || null,
         m.due || null, m.status, m.freq, m.priority, m.cat]
      );
    }

    // ─── TICKETS ─────────────────────────────────────────────────────────────
    console.log("Seeding tickets...");
    for (const t of INIT_TICKETS) {
      await run(
        `INSERT OR REPLACE INTO tickets (id,tenant_id,asset_label,asset_id,problem,priority,status,
           reported_by,assignee,assignee_id,reported_date,cost,location,
           created_at,started_at,resolved_at,esc_level,esc_log,source,tat_minutes,category,resolution)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [t.id, defaultTenantId, t.asset, t.assetId || null, t.problem, t.priority, t.status,
         t.by, t.assignee || null, t.assigneeId || null, t.date || null,
         t.cost || null, t.loc, t.createdAt || null, t.startedAt || null,
         t.resolvedAt || null, t.escLevel, JSON.stringify(t.escLog || []),
         t.source, t.tatMins || null, t.category, t.resolution || null]
      );
    }

    // ─── VENDORS ─────────────────────────────────────────────────────────────
    console.log("Seeding vendors...");
    for (const v of INIT_VENDORS) {
      await run(
        `INSERT OR REPLACE INTO vendors (id,tenant_id,name,contact,phone,email,category,amc_end,amc_value,status,last_visit)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [v.id, defaultTenantId, v.name, v.contact, v.phone, v.email, v.cat,
         v.amcEnd || null, v.amcVal || null, v.status, v.lastVisit || null]
      );
    }

    // ─── INVENTORY ───────────────────────────────────────────────────────────
    console.log("Seeding inventory...");
    for (const i of INIT_INVENTORY) {
      await run(
        `INSERT OR REPLACE INTO inventory (id,tenant_id,name,qty,min_qty,unit,vendor,cost,location)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [i.id, defaultTenantId, i.name, i.qty, i.min, i.unit, i.vendor, i.cost, i.loc]
      );
    }

    // ─── INCIDENTS ───────────────────────────────────────────────────────────
    console.log("Seeding incidents...");
    for (const inc of INIT_INCIDENTS) {
      await run(
        `INSERT OR REPLACE INTO incidents (id,tenant_id,type,location,severity,description,reported_by,
           incident_date,status,rca,preventive)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [inc.id, defaultTenantId, inc.type, inc.loc, inc.sev, inc.desc, inc.by,
         inc.date || null, inc.status, inc.rca || null, inc.preventive || null]
      );
    }

    // ─── DOCUMENTS ───────────────────────────────────────────────────────────
    console.log("Seeding documents...");
    for (const d of INIT_DOCS) {
      await run(
        `INSERT OR REPLACE INTO documents (id,tenant_id,name,doc_type,uploaded_at,expiry,size_label)
         VALUES (?,?,?,?,?,?,?)`,
        [d.id, defaultTenantId, d.name, d.type, d.uploaded || null, d.expiry || null, d.size || null]
      );
    }

    // ─── PROJECTS ────────────────────────────────────────────────────────────
    console.log("Seeding projects...");
    for (const p of INIT_PROJECTS) {
      await run(
        `INSERT OR REPLACE INTO projects (id,tenant_id,name,status,budget,spent,start_date,end_date,lead,progress,priority)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [p.id, defaultTenantId, p.name, p.status, p.budget, p.spent, p.start || null, p.end || null,
         p.lead, p.progress, p.priority]
      );
    }

    // ─── UTILITIES ───────────────────────────────────────────────────────────
    console.log("Seeding utilities...");
    const monthKeys = { Oct:"2024-10", Nov:"2024-11", Dec:"2024-12", Jan:"2025-01", Feb:"2025-02", Mar:"2025-03" };
    for (const u of UTILITY_DATA) {
      await run(
        `INSERT OR REPLACE INTO utilities (tenant_id,month_key,grid_kwh,solar_kwh,water_kl,diesel_l)
         VALUES (?,?,?,?,?,?)`,
        [defaultTenantId, monthKeys[u.m] || u.m, u.grid, u.solar, u.water, u.diesel]
      );
    }

    // ─── NOTIFICATIONS ───────────────────────────────────────────────────────
    console.log("Seeding notifications...");
    for (const n of NOTIF_LOG) {
      await run(
        `INSERT OR REPLACE INTO notifications (id,tenant_id,user_id,title,body,notif_type,channel,is_read)
         VALUES (?,?,?,?,?,?,?,?)`,
        [n.id, defaultTenantId, n.userId, n.title, n.body || null, n.type, n.channel, n.isRead ? 1 : 0]
      );
    }

    console.log("✅ All tables seeded successfully.");
    await saveDb();
  } catch (e) {
    console.error("❌ Seed failed:", e.message);
    throw e;
  }
}

seed().catch(() => process.exit(1));
