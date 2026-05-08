// GET / PUT — read or update the current tenant's settings (AI key, branding, locale).
// AI key is stored in plaintext for now (TODO: encrypt at rest with crypto.subtle).

const { query } = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const ADMIN_ROLES = new Set(["owner", "admin", "facility_manager"]);

const toApi = (r, includeAiKey) => ({
  tenantId:     r.tenant_id,
  // Only return the key to admins; for others, return masked value.
  openaiApiKey: includeAiKey ? r.openai_api_key : (r.openai_api_key ? "••••••••" + (r.openai_api_key.slice(-4) || "") : null),
  hasAiKey:     !!r.openai_api_key,
  aiModel:      r.ai_model,
  logoUrl:      r.logo_url,
  brandColor:   r.brand_color,
  timezone:     r.timezone,
  locale:       r.locale,
  currency:     r.currency,
  whatsappNumber: r.whatsapp_number,
  notifyEmail:  r.notify_email,
});

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  try {
    const claims = requireTenant(event);
    const isAdmin = ADMIN_ROLES.has(claims.role);

    switch (event.httpMethod) {
      case "GET": {
        let rows = await query(
          "SELECT * FROM tenant_settings WHERE tenant_id = $1",
          [claims.tenantId]
        );
        if (!rows.length) {
          await query(
            "INSERT INTO tenant_settings (tenant_id) VALUES ($1) ON CONFLICT DO NOTHING",
            [claims.tenantId]
          );
          rows = await query(
            "SELECT * FROM tenant_settings WHERE tenant_id = $1",
            [claims.tenantId]
          );
        }
        return ok(toApi(rows[0], isAdmin));
      }
      case "PUT": {
        if (!isAdmin) return fail(403, "Only admins can change organization settings.");
        const body = JSON.parse(event.body || "{}");
        const fields = {
          openai_api_key:  body.openaiApiKey,
          ai_model:        body.aiModel,
          logo_url:        body.logoUrl,
          brand_color:     body.brandColor,
          timezone:        body.timezone,
          locale:          body.locale,
          currency:        body.currency,
          whatsapp_number: body.whatsappNumber,
          notify_email:    body.notifyEmail,
        };
        const sets = [], vals = [];
        for (const [k, v] of Object.entries(fields)) {
          if (v !== undefined) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
        }
        if (!sets.length) return fail(400, "no updatable fields");
        sets.push(`updated_at = CURRENT_TIMESTAMP`);
        vals.push(claims.tenantId);
        const rows = await query(
          `UPDATE tenant_settings SET ${sets.join(", ")}
           WHERE tenant_id = $${vals.length}
           RETURNING *`,
          vals
        );
        if (!rows.length) {
          // First update — row didn't exist; create it then re-update.
          await query(
            "INSERT INTO tenant_settings (tenant_id) VALUES ($1)",
            [claims.tenantId]
          );
          const retry = await query(
            `UPDATE tenant_settings SET ${sets.join(", ")}
             WHERE tenant_id = $${vals.length}
             RETURNING *`,
            vals
          );
          return ok(toApi(retry[0], true));
        }
        return ok(toApi(rows[0], true));
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("tenant-settings error:", e.message);
    return fail(500, "Server error");
  }
};
