const { query }    = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const toApi = (r) => ({
  id:        r.id,
  name:      r.name,
  contact:   r.contact,
  phone:     r.phone,
  email:     r.email,
  cat:       r.category,
  amcEnd:    r.amc_end,
  amcVal:    r.amc_value !== null ? Number(r.amc_value) : null,
  status:    r.status,
  lastVisit: r.last_visit,
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
          "SELECT * FROM vendors WHERE tenant_id = $1 ORDER BY name",
          [tenantId]
        );
        return ok(rows.map(toApi));
      }
      case "POST": {
        const newId = body.id || `V${Date.now().toString(36).toUpperCase()}`;
        const rows = await query(
          `INSERT INTO vendors (id,tenant_id,name,contact,phone,email,category,amc_end,amc_value,status,last_visit)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,'active'),$11)
           RETURNING *`,
          [newId, tenantId, body.name, body.contact || null, body.phone || null, body.email || null,
           body.cat || body.category || null, body.amcEnd || null,
           body.amcVal || null, body.status, body.lastVisit || null]
        );
        return ok(toApi(rows[0]));
      }
      case "PUT": {
        if (!id) return fail(400, "id required");
        const fields = {
          name:      body.name,    contact:   body.contact,
          phone:     body.phone,   email:     body.email,
          category:  body.cat || body.category,
          amc_end:   body.amcEnd, amc_value: body.amcVal,
          status:    body.status, last_visit: body.lastVisit,
        };
        const sets = [], vals = [];
        for (const [k, v] of Object.entries(fields)) {
          if (v !== undefined) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
        }
        if (!sets.length) return fail(400, "no updatable fields");
        vals.push(id, tenantId);
        const rows = await query(
          `UPDATE vendors SET ${sets.join(", ")}
           WHERE id = $${vals.length - 1} AND tenant_id = $${vals.length}
           RETURNING *`,
          vals
        );
        if (!rows.length) return fail(404, "Vendor not found");
        return ok(toApi(rows[0]));
      }
      case "DELETE": {
        if (!id) return fail(400, "id required");
        await query("DELETE FROM vendors WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
        return ok({ id });
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("vendors error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
