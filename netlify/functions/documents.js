const { query }    = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

const toApi = (r) => ({
  id:       r.id,
  name:     r.name,
  type:     r.doc_type,
  uploaded: r.uploaded_at,
  expiry:   r.expiry,
  size:     r.size_label,
  url:      r.storage_url,
  expired:  r.expiry ? new Date(r.expiry) < new Date() : false,
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
          "SELECT * FROM documents WHERE tenant_id = $1 ORDER BY uploaded_at DESC NULLS LAST",
          [tenantId]
        );
        return ok(rows.map(toApi));
      }
      case "POST": {
        const newId = body.id || `D${Date.now().toString(36).toUpperCase()}`;
        const rows = await query(
          `INSERT INTO documents (id,tenant_id,name,doc_type,uploaded_at,expiry,size_label,storage_url)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           RETURNING *`,
          [newId, tenantId, body.name, body.type || body.doc_type || "other",
           body.uploaded || body.uploaded_at || null,
           body.expiry || null, body.size || body.size_label || null,
           body.url || body.storage_url || null]
        );
        return ok(toApi(rows[0]));
      }
      case "PUT": {
        if (!id) return fail(400, "id required");
        const fields = {
          name:        body.name,
          doc_type:    body.type || body.doc_type,
          uploaded_at: body.uploaded || body.uploaded_at,
          expiry:      body.expiry,
          size_label:  body.size || body.size_label,
          storage_url: body.url || body.storage_url,
        };
        const sets = [], vals = [];
        for (const [k, v] of Object.entries(fields)) {
          if (v !== undefined) { vals.push(v); sets.push(`${k} = $${vals.length}`); }
        }
        if (!sets.length) return fail(400, "no updatable fields");
        vals.push(id, tenantId);
        const rows = await query(
          `UPDATE documents SET ${sets.join(", ")}
           WHERE id = $${vals.length - 1} AND tenant_id = $${vals.length}
           RETURNING *`,
          vals
        );
        if (!rows.length) return fail(404, "Document not found");
        return ok(toApi(rows[0]));
      }
      case "DELETE": {
        if (!id) return fail(400, "id required");
        await query("DELETE FROM documents WHERE id = $1 AND tenant_id = $2", [id, tenantId]);
        return ok({ id });
      }
      default: return fail(405, "Method not allowed");
    }
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("documents error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
