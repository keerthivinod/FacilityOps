const { query }    = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const toApi = (r) => ({
  id:       r.id,
  code:     r.code,
  name:     r.name,
  cat:      r.category,
  icon:     r.icon,
  loc:      r.location,
  status:   r.status,
  last:     r.last_service,
  next:     r.next_service,
  vendor:   r.vendor,
  amc:      r.amc,
  interval: r.interval_days,
  model:    r.model,
  serial:   r.serial,
  install:  r.install_date,
  warranty: r.warranty_end,
  critical: r.critical,
  qr:       r.qr,
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
          "SELECT * FROM assets WHERE tenant_id = $1 ORDER BY code",
          [tenantId]
        );
        return ok(rows.map(toApi));
      }
      case "POST": {
        const newId = body.id || `A${Date.now().toString(36).toUpperCase()}`;
        const newCode = body.code || newId;
        const rows = await query(
          `INSERT INTO assets
             (id,tenant_id,code,name,category,icon,location,status,last_service,next_service,
              vendor,amc,interval_days,model,serial,install_date,warranty_end,critical,qr)
           VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,'healthy'),$9,$10,$11,
                   COALESCE($12,false),$13,$14,$15,$16,$17,COALESCE($18,false),$19)
           RETURNING *`,
          [newId, tenantId, newCode, body.name, body.cat || body.category, body.icon || null,
           body.loc || body.location || null, body.status,
           body.last || body.last_service || null, body.next || body.next_service || null,
           body.vendor || null, body.amc, body.interval || body.interval_days || null,
           body.model || null, body.serial || null,
           body.install || body.install_date || null, body.warranty || body.warranty_end || null,
           body.critical, body.qr || null]
        );
        return ok(toApi(rows[0]));
      }
      case "PUT": {
        if (!id) return fail(400, "id required");
        const fields = {
          name:         body.name,
          category:     body.cat || body.category,
          location:     body.loc || body.location,
          status:       body.status,
          last_service: body.last || body.lastService || body.last_service,
          next_service: body.next || body.nextService || body.next_service,
          vendor:       body.vendor,
          amc:          body.amc,
          interval_days:body.interval || body.intervalDays || body.interval_days,
          critical:     body.critical,
        };
        const sets = [], vals = [];
        for (const [k, v] of Object.entries(fields)) {
          if (v !== undefined) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
        }
        if (!sets.length) return fail(400, "no updatable fields");
        vals.push(id, tenantId);
        const rows = await query(
          `UPDATE assets SET ${sets.join(", ")}
           WHERE id = $${vals.length - 1} AND tenant_id = $${vals.length}
           RETURNING *`,
          vals
        );
        if (!rows.length) return fail(404, "Asset not found");
        return ok(toApi(rows[0]));
      }
      case "DELETE": {
        if (!id) return fail(400, "id required");
        await query("DELETE FROM assets WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
        return ok({ id });
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("assets error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
