// Shared SQLite database — reused across warm Lambda invocations.
const fs = require("fs");
const initSqlJs = require("sql.js");

let db;

async function getDb() {
  if (!db) {
    const SQL = await initSqlJs();
    const dbPath = process.env.DATABASE_URL || "facilityops.db";
    try {
      const filebuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(filebuffer);
    } catch (e) {
      db = new SQL.Database();
    }
  }
  return db;
}

async function query(text, params = []) {
  const database = await getDb();
  const stmt = database.prepare(text);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

async function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dbPath = process.env.DATABASE_URL || "facilityops.db";
    fs.writeFileSync(dbPath, buffer);
  }
}

// Save database on process exit
process.on('exit', saveDb);
process.on('SIGINT', () => {
  saveDb();
  process.exit();
});

module.exports = { query, getDb, saveDb };
