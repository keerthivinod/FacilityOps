const { query }    = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const toApi = (r) => ({
  id:      r.id,
  title:   r.title,
  body:    r.body,
  time:    r.created_at,
  type:    r.notif_type,
  read:    r.is_read,
  channel: r.channel,
  userId:  r.user_id,
});

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  try {
    const claims = requireTenant(event);
    const { tenantId } = claims;
    const id     = event.queryStringParameters?.id;
    const body   = event.body ? JSON.parse(event.body) : null;

    switch (event.httpMethod) {
      case "GET": {
        const rows = await query(
          `SELECT * FROM notifications
           WHERE tenant_id = $1 AND (user_id = $2 OR user_id IS NULL)
           ORDER BY created_at DESC LIMIT 100`,
          [tenantId, claims.sub]
        );
        return ok(rows.map(toApi));
      }
      case "POST": {
        const newId = body.id || `N${Date.now().toString(36).toUpperCase()}`;
        const rows = await query(
          `INSERT INTO notifications (id,tenant_id,user_id,title,body,notif_type,channel,is_read)
           VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'push'),COALESCE($8,false))
           RETURNING *`,
          [newId, tenantId, body.userId || claims.sub, body.title, body.body || null,
           body.type || null, body.channel, body.read ?? false]
        );
        return ok(toApi(rows[0]));
      }
      case "PUT": {
        if (!id) return fail(400, "id required");
        const rows = await query(
          "UPDATE notifications SET is_read = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *",
          [body.read ?? true, id, tenantId]
        );
        if (!rows.length) return fail(404, "Notification not found");
        return ok(toApi(rows[0]));
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("notifications error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
