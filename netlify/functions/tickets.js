const { query } = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const toApi = (r) => ({
  id:         r.id,
  asset:      r.asset_label,
  assetId:    r.asset_id,
  problem:    r.problem,
  priority:   r.priority,
  status:     r.status,
  by:         r.reported_by,
  assignee:   r.assignee,
  assigneeId: r.assignee_id,
  date:       r.reported_date,
  cost:       r.cost !== null ? Number(r.cost) : null,
  loc:        r.location,
  createdAt:  r.created_at,
  startedAt:  r.started_at,
  resolvedAt: r.resolved_at,
  escLevel:   r.esc_level,
  escLog:     r.esc_log || [],
  source:     r.source,
  tatMins:    r.tat_minutes,
  category:   r.category,
  resolution: r.resolution,
});

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  try {
    const { tenantId } = requireTenant(event);
    const id   = event.queryStringParameters?.id;
    const body = event.body ? JSON.parse(event.body) : null;

    switch (event.httpMethod) {
      case "GET": {
        const rows = await query(
          `SELECT * FROM tickets WHERE tenant_id = $1
           ORDER BY created_at DESC LIMIT 500`,
          [tenantId]
        );
        return ok(rows.map(toApi));
      }
      case "POST": {
        const newId = body.id || `T${Date.now().toString(36).toUpperCase()}`;
        const rows = await query(
          `INSERT INTO tickets
             (id,tenant_id,asset_label,asset_id,problem,priority,status,reported_by,assignee,assignee_id,
              reported_date,cost,location,created_at,started_at,resolved_at,
              esc_level,esc_log,source,tat_minutes,category,resolution)
           VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'open'),$8,$9,$10,$11,$12,$13,
                   COALESCE($14,NOW()),$15,$16,COALESCE($17,0),
                   COALESCE($18,'[]')::jsonb,COALESCE($19,'app'),$20,$21,$22)
           RETURNING *`,
          [newId, tenantId, body.asset || null, body.assetId || null, body.problem,
           body.priority, body.status, body.by || null,
           body.assignee || null, body.assigneeId || null,
           body.date || null, body.cost || null, body.loc || null,
           body.createdAt || null, body.startedAt || null, body.resolvedAt || null,
           body.escLevel, JSON.stringify(body.escLog || []),
           body.source, body.tatMins || null, body.category || null,
           body.resolution || null]
        );
        return ok(toApi(rows[0]));
      }
      case "PUT": {
        if (!id) return fail(400, "id required");
        const fields = {
          asset_label: body.asset,      status:      body.status,
          priority:    body.priority,   assignee:    body.assignee,
          assignee_id: body.assigneeId, started_at:  body.startedAt,
          resolved_at: body.resolvedAt, esc_level:   body.escLevel,
          esc_log:     body.escLog !== undefined ? JSON.stringify(body.escLog) : undefined,
          tat_minutes: body.tatMins,    resolution:  body.resolution,
          cost:        body.cost,
        };
        const sets = [], vals = [];
        for (const [k, v] of Object.entries(fields)) {
          if (v !== undefined) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
        }
        if (!sets.length) return fail(400, "no updatable fields");
        vals.push(id, tenantId);
        const rows = await query(
          `UPDATE tickets SET ${sets.join(", ")}
           WHERE id = $${vals.length - 1} AND tenant_id = $${vals.length}
           RETURNING *`,
          vals
        );
        if (!rows.length) return fail(404, "Ticket not found");
        return ok(toApi(rows[0]));
      }
      case "DELETE": {
        if (!id) return fail(400, "id required");
        await query("DELETE FROM tickets WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
        return ok({ id });
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("tickets error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
