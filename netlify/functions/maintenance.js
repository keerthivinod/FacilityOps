const { query }    = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const toApi = (r) => ({
  id:          r.id,
  assetId:     r.asset_id,
  asset:       r.asset_label,
  task:        r.task,
  assignee:    r.assignee,
  assigneeId:  r.assignee_id,
  due:         r.due_date,
  status:      r.status,
  freq:        r.frequency,
  priority:    r.priority,
  cat:         r.category,
  completedAt: r.completed_at,
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
          "SELECT * FROM maintenance_tasks WHERE tenant_id = $1 ORDER BY due_date NULLS LAST",
          [tenantId]
        );
        return ok(rows.map(toApi));
      }
      case "POST": {
        const newId = body.id || `M${Date.now().toString(36).toUpperCase()}`;
        const rows = await query(
          `INSERT INTO maintenance_tasks
             (id,tenant_id,asset_id,asset_label,task,assignee,assignee_id,due_date,status,frequency,priority,category)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,'scheduled'),$10,COALESCE($11,'medium'),$12)
           RETURNING *`,
          [newId, tenantId, body.assetId || null, body.asset || null, body.task,
           body.assignee || null, body.assigneeId || null,
           body.due || body.due_date || null, body.status,
           body.freq || body.frequency || null, body.priority, body.cat || body.category || null]
        );
        return ok(toApi(rows[0]));
      }
      case "PUT": {
        if (!id) return fail(400, "id required");
        const fields = {
          status:       body.status,
          assignee:     body.assignee,
          assignee_id:  body.assigneeId,
          due_date:     body.due || body.due_date,
          priority:     body.priority,
          completed_at: body.completedAt,
        };
        const sets = [], vals = [];
        for (const [k, v] of Object.entries(fields)) {
          if (v !== undefined) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
        }
        if (!sets.length) return fail(400, "no updatable fields");
        vals.push(id, tenantId);
        const rows = await query(
          `UPDATE maintenance_tasks SET ${sets.join(", ")}
           WHERE id = $${vals.length - 1} AND tenant_id = $${vals.length}
           RETURNING *`,
          vals
        );
        if (!rows.length) return fail(404, "Task not found");
        return ok(toApi(rows[0]));
      }
      case "DELETE": {
        if (!id) return fail(400, "id required");
        await query("DELETE FROM maintenance_tasks WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
        return ok({ id });
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("maintenance error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
