// POST { currentPassword, newPassword } → { token, user }
// Used for both first-login forced change AND voluntary password change.
// Returns a fresh JWT so the client can clear must_change_password locally.

const bcrypt = require("bcryptjs");
const { query } = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireAuth, sign } = require("./lib/auth");

const MIN_LENGTH = 8;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  if (event.httpMethod !== "POST")    return fail(405, "Method not allowed");

  try {
    const claims = requireAuth(event);
    const { currentPassword, newPassword } = JSON.parse(event.body || "{}");

    if (!newPassword) return fail(400, "newPassword required");
    if (newPassword.length < MIN_LENGTH) {
      return fail(400, `Password must be at least ${MIN_LENGTH} characters.`);
    }
    if (currentPassword === newPassword) {
      return fail(400, "New password must differ from current password.");
    }

    const rows = await query(
      `SELECT u.id, u.username, u.email, u.password_hash, u.name, u.role, u.initials, u.dept,
              u.tenant_id, u.is_super_admin, u.active,
              t.name AS tenant_name, t.status AS tenant_status, t.plan AS tenant_plan
       FROM users u LEFT JOIN tenants t ON t.id = u.tenant_id
       WHERE u.id = $1 LIMIT 1`,
      [claims.sub]
    );
    if (!rows.length) return fail(404, "User not found");
    const u = rows[0];
    if (!u.active) return fail(403, "Account is disabled.");

    // Verify current password unless this is a forced first-login change.
    const matches = await bcrypt.compare(currentPassword || "", u.password_hash);
    if (!matches && !claims.mustChangePassword) {
      return fail(401, "Current password is incorrect.");
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await query(
      `UPDATE users
       SET password_hash = $1,
           must_change_password = false,
           password_changed_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newHash, u.id]
    );

    const user = {
      id:                 u.id,
      name:               u.name,
      email:              u.email,
      username:           u.username,
      role:               u.role,
      initials:           u.initials,
      dept:               u.dept,
      tenantId:           u.tenant_id,
      tenantName:         u.tenant_name,
      tenantStatus:       u.tenant_status,
      tenantPlan:         u.tenant_plan,
      isSuperAdmin:       u.is_super_admin,
      mustChangePassword: false,
    };

    return ok({ token: sign(user), user });
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    console.error("change-password error:", e.message);
    return fail(500, "Server error");
  }
};
