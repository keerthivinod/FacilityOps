const { query }    = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const MONTH_ABBR = {
  "01":"Jan","02":"Feb","03":"Mar","04":"Apr","05":"May","06":"Jun",
  "07":"Jul","08":"Aug","09":"Sep","10":"Oct","11":"Nov","12":"Dec",
};

const toApi = (r) => {
  const [, mm] = (r.month_key || "").split("-");
  return {
    id:        r.id,
    monthKey:  r.month_key,
    m:         mm ? (MONTH_ABBR[mm] || r.month_key) : r.month_key,
    grid:      r.grid_kwh   !== null ? Number(r.grid_kwh)   : 0,
    solar:     r.solar_kwh  !== null ? Number(r.solar_kwh)  : 0,
    water:     r.water_kl   !== null ? Number(r.water_kl)   : 0,
    diesel:    r.diesel_l   !== null ? Number(r.diesel_l)   : 0,
  };
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  try {
    const { tenantId } = requireTenant(event);
    const body = event.body ? JSON.parse(event.body) : null;

    switch (event.httpMethod) {
      case "GET": {
        const rows = await query(
          "SELECT * FROM utilities WHERE tenant_id = $1 ORDER BY month_key LIMIT 12",
          [tenantId]
        );
        return ok(rows.map(toApi));
      }
      case "POST": {
        const monthKey = body.monthKey || body.month_key;
        const rows = await query(
          `INSERT INTO utilities (tenant_id,month_key,grid_kwh,solar_kwh,water_kl,diesel_l)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (tenant_id, month_key) DO UPDATE SET
             grid_kwh=EXCLUDED.grid_kwh, solar_kwh=EXCLUDED.solar_kwh,
             water_kl=EXCLUDED.water_kl, diesel_l=EXCLUDED.diesel_l
           RETURNING *`,
          [tenantId, monthKey,
           body.grid ?? body.grid_kwh ?? 0,
           body.solar ?? body.solar_kwh ?? 0,
           body.water ?? body.water_kl ?? 0,
           body.diesel ?? body.diesel_l ?? 0]
        );
        return ok(toApi(rows[0]));
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("utilities error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
