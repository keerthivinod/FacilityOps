// JWT helpers for Netlify Functions.
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const TTL    = "8h";

function sign(user) {
  if (!SECRET) throw new Error("JWT_SECRET not configured");
  return jwt.sign(
    {
      sub:                user.id,
      email:              user.email,
      role:               user.role,
      tenantId:           user.tenantId || null,
      isSuperAdmin:       !!user.isSuperAdmin,
      mustChangePassword: !!user.mustChangePassword,
    },
    SECRET,
    { expiresIn: TTL }
  );
}

function verify(token) {
  if (!SECRET) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// Throws 401 if the request has no valid bearer token.
function requireAuth(event) {
  const header = event.headers?.authorization || event.headers?.Authorization || "";
  const match  = header.match(/^Bearer (.+)$/);
  if (!match) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  const claims = verify(match[1]);
  if (!claims) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  return claims;
}

// Throws 401 if no auth, 403 if no tenant scope. Use for entity endpoints.
function requireTenant(event) {
  const claims = requireAuth(event);
  if (!claims.tenantId) {
    const err = new Error("Tenant context required");
    err.status = 403;
    throw err;
  }
  return claims;
}

// Throws unless the caller is the platform super-admin.
function requireSuperAdmin(event) {
  const claims = requireAuth(event);
  if (!claims.isSuperAdmin) {
    const err = new Error("Super-admin only");
    err.status = 403;
    throw err;
  }
  return claims;
}

// Throws unless caller has one of the allowed roles within their tenant.
function requireRole(event, allowedRoles) {
  const claims = requireTenant(event);
  if (!allowedRoles.includes(claims.role)) {
    const err = new Error("Insufficient role");
    err.status = 403;
    throw err;
  }
  return claims;
}

module.exports = { sign, verify, requireAuth, requireTenant, requireSuperAdmin, requireRole };
