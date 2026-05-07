// Uniform JSON response envelope + CORS headers.
const CORS = {
  "Access-Control-Allow-Origin":  process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Content-Type": "application/json",
};

const ok = (data, meta) => ({
  statusCode: 200,
  headers: CORS,
  body: JSON.stringify({ success: true, data, ...(meta ? { meta } : {}) }),
});

const fail = (status, msg) => ({
  statusCode: status,
  headers: CORS,
  body: JSON.stringify({ success: false, error: msg }),
});

const preflight = () => ({ statusCode: 204, headers: CORS, body: "" });

module.exports = { ok, fail, preflight };
