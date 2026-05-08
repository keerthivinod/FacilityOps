// POST { username, password } → { token, user }
const bcrypt = require("bcryptjs");
const { query } = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { sign } = require("./lib/auth");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  if (event.httpMethod !== "POST")    return fail(405, "Method not allowed");

  let username, password;
  try {
    ({ username, password } = JSON.parse(event.body || "{}"));
  } catch {
    return fail(400, "Invalid JSON body");
  }

  if (!username || !password) return fail(400, "username and password required");

  try {
    const rows = await query(
      `SELECT id, username, email, password_hash, name, role, initials, dept,
              tenant_id, is_super_admin, must_change_password, active
       FROM users
       WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
       LIMIT 1`,
      [username.trim()]
    );

    if (!rows.length) return fail(401, "Invalid username or password.");

    const u = rows[0];
    if (!u.active) return fail(403, "Account is disabled. Contact your administrator.");

    const match = await bcrypt.compare(password, u.password_hash);
    if (!match) return fail(401, "Invalid username or password.");

    // If user belongs to a tenant, verify the tenant is not suspended/cancelled.
    let tenantName = null, tenantStatus = null, tenantPlan = null;
    if (u.tenant_id) {
      const t = await query(
        "SELECT name, status, plan FROM tenants WHERE id = $1",
        [u.tenant_id]
      );
      if (!t.length) return fail(403, "Organization not found.");
      const blocked = ["suspended", "cancelled"];
      if (blocked.includes(t[0].status)) {
        return fail(403, `Organization is ${t[0].status}. Contact support.`);
      }
      tenantName   = t[0].name;
      tenantStatus = t[0].status;
      tenantPlan   = t[0].plan;
    }

    // Touch last_login_at for audit / activity tracking.
    await query("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1", [u.id]);

    const user = {
      id:                 u.id,
      name:               u.name,
      email:              u.email,
      username:           u.username,
      role:               u.role,
      initials:           u.initials,
      dept:               u.dept,
      tenantId:           u.tenant_id,
      tenantName:         tenantName,
      tenantStatus:       tenantStatus,
      tenantPlan:         tenantPlan,
      isSuperAdmin:       u.is_super_admin,
      mustChangePassword: u.must_change_password,
    };

    return ok({ token: sign(user), user });
  } catch (e) {
    console.error("auth-verify error:", e.message);
    return fail(500, "Authentication error");
  }
};
