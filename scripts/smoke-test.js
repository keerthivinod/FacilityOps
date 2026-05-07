// Smoke-test all 11 entity endpoints + auth-verify against local netlify dev.
// Usage: node scripts/smoke-test.js

const BASE = "http://localhost:8888/.netlify/functions";

async function postJson(url, body) {
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  return { status: res.status, json: await res.json() };
}

async function getJson(url, token) {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

(async () => {
  console.log("1. POST /auth-verify with valid creds...");
  const auth = await postJson(`${BASE}/auth-verify`, {
    username: "keerthi", password: "facility123",
  });
  if (!auth.json.success) {
    console.error("   FAIL:", auth.json);
    process.exit(1);
  }
  const token = auth.json.data.token;
  console.log(`   OK — user: ${auth.json.data.user.name} (${auth.json.data.user.role})`);

  console.log("\n2. POST /auth-verify with bad password (expect 401)...");
  const bad = await postJson(`${BASE}/auth-verify`, {
    username: "keerthi", password: "wrongpass",
  });
  console.log(`   ${bad.status === 401 ? "OK" : "FAIL"} — got ${bad.status}`);

  console.log("\n3. GET /tickets without token (expect 401)...");
  const noAuth = await getJson(`${BASE}/tickets`);
  console.log(`   ${noAuth.status === 401 ? "OK" : "FAIL"} — got ${noAuth.status}`);

  console.log("\n4. GET each entity endpoint with token...");
  const endpoints = ["tickets","assets","maintenance","vendors","inventory","team","incidents","documents","projects","utilities","notifications"];
  let allOk = true;
  for (const ep of endpoints) {
    const r = await getJson(`${BASE}/${ep}`, token);
    const count = r.json.success ? r.json.data.length : `ERROR: ${r.json.error}`;
    const ok = r.json.success && Array.isArray(r.json.data);
    if (!ok) allOk = false;
    console.log(`   ${ok ? "OK" : "FAIL"}  ${ep.padEnd(15)} ${typeof count === "number" ? count + " rows" : count}`);
  }
  console.log(allOk ? "\n✅ All endpoints healthy." : "\n❌ Some endpoints failed.");
  process.exit(allOk ? 0 : 1);
})();
