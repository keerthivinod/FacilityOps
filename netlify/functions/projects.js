const { query }    = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const toApi = (r) => ({
  id:       r.id,
  name:     r.name,
  status:   r.status,
  budget:   r.budget !== null ? Number(r.budget) : null,
  spent:    r.spent !== null ? Number(r.spent) : 0,
  start:    r.start_date,
  end:      r.end_date,
  lead:     r.lead,
  progress: r.progress,
  priority: r.priority,
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
          "SELECT * FROM projects WHERE tenant_id = $1 ORDER BY start_date NULLS LAST",
          [tenantId]
        );
        return ok(rows.map(toApi));
      }
      case "POST": {
        const newId = body.id || `P${Date.now().toString(36).toUpperCase()}`;
        const rows = await query(
          `INSERT INTO projects (id,tenant_id,name,status,budget,spent,start_date,end_date,lead,progress,priority)
           VALUES ($1,$2,$3,COALESCE($4,'planned'),$5,COALESCE($6,0),$7,$8,$9,COALESCE($10,0),$11)
           RETURNING *`,
          [newId, tenantId, body.name, body.status, body.budget || null,
           body.spent || 0, body.start || body.start_date || null,
           body.end || body.end_date || null, body.lead || null,
           body.progress || 0, body.priority || "medium"]
        );
        return ok(toApi(rows[0]));
      }
      case "PUT": {
        if (!id) return fail(400, "id required");
        const fields = {
          name:       body.name,     status:     body.status,
          budget:     body.budget,   spent:      body.spent,
          start_date: body.start || body.start_date,
          end_date:   body.end   || body.end_date,
          lead:       body.lead,     progress:   body.progress,
          priority:   body.priority,
        };
        const sets = [], vals = [];
        for (const [k, v] of Object.entries(fields)) {
          if (v !== undefined) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
        }
        if (!sets.length) return fail(400, "no updatable fields");
        vals.push(id, tenantId);
        const rows = await query(
          `UPDATE projects SET ${sets.join(", ")}
           WHERE id = $${vals.length - 1} AND tenant_id = $${vals.length}
           RETURNING *`,
          vals
        );
        if (!rows.length) return fail(404, "Project not found");
        return ok(toApi(rows[0]));
      }
      case "DELETE": {
        if (!id) return fail(400, "id required");
        await query("DELETE FROM projects WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
        return ok({ id });
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("projects error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
