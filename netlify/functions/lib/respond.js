// Uniform JSON response envelope + CORS headers.
const CORS = {
  "Access-Control-Allow-Origin":  process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Content-Type": "application/json",
};

const ok = (data, meta, extraHeaders = {}) => ({
  statusCode: 200,
  headers: { ...CORS, ...extraHeaders },
  body: JSON.stringify({ success: true, data, ...(meta ? { meta } : {}) }),
});

const fail = (status, msg, extraHeaders = {}) => ({
  statusCode: status,
  headers: { ...CORS, ...extraHeaders },
  body: JSON.stringify({ success: false, error: msg }),
});

const preflight = (extraHeaders = {}) => ({ statusCode: 204, headers: { ...CORS, ...extraHeaders }, body: "" });

module.exports = { ok, fail, preflight };
