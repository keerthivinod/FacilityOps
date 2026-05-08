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

  // Convert postgres-style $1 parameters and array to sqlite ? parameters
  let boundParams = params;
  let parsedText = text;

  if (Array.isArray(params) && params.length > 0 && text.includes('$')) {
    const newParams = [];
    // Only replace variables like $1, $2 (not strings that might coincidentally contain $)
    parsedText = text.replace(/\$([0-9]+)/g, (match, p1) => {
       newParams.push(params[parseInt(p1) - 1]);
       return '?';
    });
    boundParams = newParams;
  }

  const stmt = database.prepare(parsedText);
  if (boundParams && (Array.isArray(boundParams) ? boundParams.length > 0 : Object.keys(boundParams).length > 0)) {
    stmt.bind(boundParams);
  }

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
