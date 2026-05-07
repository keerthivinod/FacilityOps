const { query }    = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const toApi = (r) => ({
  id:     r.id,
  name:   r.name,
  qty:    Number(r.qty),
  min:    Number(r.min_qty),
  unit:   r.unit,
  vendor: r.vendor,
  cost:   r.cost !== null ? Number(r.cost) : null,
  loc:    r.location,
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
          "SELECT * FROM inventory WHERE tenant_id = $1 ORDER BY name",
          [tenantId]
        );
        return ok(rows.map(toApi));
      }
      case "POST": {
        const newId = body.id || `I${Date.now().toString(36).toUpperCase()}`;
        const rows = await query(
          `INSERT INTO inventory (id,tenant_id,name,qty,min_qty,unit,vendor,cost,location)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           RETURNING *`,
          [newId, tenantId, body.name, body.qty ?? 0, body.min ?? body.min_qty ?? 0,
           body.unit || null, body.vendor || null, body.cost || null,
           body.loc || body.location || null]
        );
        return ok(toApi(rows[0]));
      }
      case "PUT": {
        if (!id) return fail(400, "id required");
        const fields = {
          name:    body.name,   qty:      body.qty,
          min_qty: body.min ?? body.min_qty,
          unit:    body.unit,   vendor:   body.vendor,
          cost:    body.cost,   location: body.loc || body.location,
        };
        const sets = [], vals = [];
        for (const [k, v] of Object.entries(fields)) {
          if (v !== undefined) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
        }
        if (!sets.length) return fail(400, "no updatable fields");
        vals.push(id, tenantId);
        const rows = await query(
          `UPDATE inventory SET ${sets.join(", ")}
           WHERE id = $${vals.length - 1} AND tenant_id = $${vals.length}
           RETURNING *`,
          vals
        );
        if (!rows.length) return fail(404, "Item not found");
        return ok(toApi(rows[0]));
      }
      case "DELETE": {
        if (!id) return fail(400, "id required");
        await query("DELETE FROM inventory WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
        return ok({ id });
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("inventory error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
