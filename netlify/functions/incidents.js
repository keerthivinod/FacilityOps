const { query }    = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const toApi = (r) => ({
  id:         r.id,
  type:       r.type,
  loc:        r.location,
  sev:        r.severity,
  desc:       r.description,
  by:         r.reported_by,
  date:       r.incident_date,
  status:     r.status,
  rca:        r.rca,
  preventive: r.preventive,
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
          "SELECT * FROM incidents WHERE tenant_id = $1 ORDER BY incident_date DESC NULLS LAST",
          [tenantId]
        );
        return ok(rows.map(toApi));
      }
      case "POST": {
        const newId = body.id || `INC${Date.now().toString(36).toUpperCase()}`;
        const rows = await query(
          `INSERT INTO incidents (id,tenant_id,type,location,severity,description,reported_by,
             incident_date,status,rca,preventive)
           VALUES ($1,$2,$3,$4,COALESCE($5,'medium'),$6,$7,$8,COALESCE($9,'investigating'),$10,$11)
           RETURNING *`,
          [newId, tenantId, body.type, body.loc || body.location || null,
           body.sev || body.severity, body.desc || body.description || null,
           body.by || body.reported_by || null, body.date || body.incident_date || null,
           body.status, body.rca || null, body.preventive || null]
        );
        return ok(toApi(rows[0]));
      }
      case "PUT": {
        if (!id) return fail(400, "id required");
        const fields = {
          type:          body.type,
          location:      body.loc || body.location,
          severity:      body.sev || body.severity,
          description:   body.desc || body.description,
          status:        body.status,
          rca:           body.rca,
          preventive:    body.preventive,
          incident_date: body.date || body.incident_date,
        };
        const sets = [], vals = [];
        for (const [k, v] of Object.entries(fields)) {
          if (v !== undefined) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
        }
        if (!sets.length) return fail(400, "no updatable fields");
        vals.push(id, tenantId);
        const rows = await query(
          `UPDATE incidents SET ${sets.join(", ")}
           WHERE id = $${vals.length - 1} AND tenant_id = $${vals.length}
           RETURNING *`,
          vals
        );
        if (!rows.length) return fail(404, "Incident not found");
        return ok(toApi(rows[0]));
      }
      case "DELETE": {
        if (!id) return fail(400, "id required");
        await query("DELETE FROM incidents WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
        return ok({ id });
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("incidents error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
