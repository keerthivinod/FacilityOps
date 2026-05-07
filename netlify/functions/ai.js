// OpenAI proxy — uses the tenant's BYOK API key from tenant_settings.
// Falls back to OPENAI_API_KEY env var only if the tenant has no key configured
// (useful for the demo tenant; production tenants must bring their own key).

const { query } = require("./lib/db");
const { ok, fail, preflight } = require("./lib/respond");
const { requireTenant } = require("./lib/auth");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  if (event.httpMethod !== "POST")    return fail(405, "Method not allowed");

  try {
    const claims = requireTenant(event);

    const settings = await query(
      "SELECT openai_api_key, ai_model FROM tenant_settings WHERE tenant_id = $1",
      [claims.tenantId]
    );

    const tenantKey = settings[0]?.openai_api_key;
    const fallbackKey = process.env.OPENAI_API_KEY;
    const apiKey = tenantKey || fallbackKey;

    if (!apiKey) {
      return fail(400, "AI is not configured. Add an OpenAI API key in Settings → AI Brain.");
    }

    const tenantModel = settings[0]?.ai_model;
    const { messages, model, systemPrompt } = JSON.parse(event.body || "{}");
    if (!messages?.length) return fail(400, "messages required");

    const payload = {
      model:       model || tenantModel || "gpt-4o-mini",
      messages:    systemPrompt
        ? [{ role: "system", content: systemPrompt }, ...messages]
        : messages,
      temperature: 0.4,
      max_tokens:  1024,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("OpenAI error:", err);
      const friendlyMsg = res.status === 401
        ? "Invalid OpenAI API key. Update it in Settings → AI Brain."
        : (err?.error?.message || "OpenAI request failed");
      return fail(res.status, friendlyMsg);
    }

    const data  = await res.json();
    const reply = data.choices?.[0]?.message?.content || "";
    return ok({ reply, usage: data.usage, usingTenantKey: !!tenantKey });
  } catch (e) {
    if (e.status === 401) return fail(401, "Unauthorized");
    if (e.status === 403) return fail(403, e.message);
    console.error("ai error:", e.message);
    return fail(500, e.message || "Server error");
  }
};
