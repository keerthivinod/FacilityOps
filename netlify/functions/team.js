const { query }    = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const toApi = (r) => ({
  id:             r.id,
  name:           r.name,
  role:           r.role,
  level:          r.level,
  phone:          r.phone,
  skills:         r.skills || [],
  icon:           r.icon,
  tasksCompleted: r.tasks_completed,
  avgTAT:         r.avg_tat,
  rating:         Number(r.rating),
  status:         r.status,
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
          "SELECT * FROM team WHERE tenant_id = $1 ORDER BY level DESC, name",
          [tenantId]
        );
        return ok(rows.map(toApi));
      }
      case "PUT": {
        if (!id) return fail(400, "id required");
        const fields = {
          status:          body.status,
          tasks_completed: body.tasksCompleted,
          avg_tat:         body.avgTAT,
          rating:          body.rating,
        };
        const sets = [], vals = [];
        for (const [k, v] of Object.entries(fields)) {
          if (v !== undefined) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
        }
        if (!sets.length) return fail(400, "no updatable fields");
        vals.push(id, tenantId);
        const rows = await query(
          `UPDATE team SET ${sets.join(", ")}
           WHERE id = $${vals.length - 1} AND tenant_id = $${vals.length}
           RETURNING *`,
          vals
        );
        if (!rows.length) return fail(404, "Staff member not found");
        return ok(toApi(rows[0]));
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("team error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
