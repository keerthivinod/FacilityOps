#!/usr/bin/env node
// Run: node scripts/migrate.js
// Creates (or updates) the database schema. Safe to re-run — all DDL is idempotent.

require("dotenv").config({ path: ".env.local" });
const fs   = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  const dbPath = process.env.DATABASE_URL || "facilityops.db";

  try {
    const SQL = await initSqlJs();
    let db;

    // Try to load existing database
    try {
      const filebuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(filebuffer);
    } catch (e) {
      // Create new database if file doesn't exist
      db = new SQL.Database();
    }

    // Execute schema
    db.run(sql);

    // Save database to file
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);

    console.log("✅ Schema migrated successfully.");
  } catch (e) {
    console.error("❌ Migration failed:", e.message);
    process.exit(1);
  }
})();
