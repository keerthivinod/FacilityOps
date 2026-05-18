const { ok, fail, preflight } = require("./lib/respond");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  if (event.httpMethod !== "POST") return fail(405, "Method not allowed");

  const isProd = process.env.NODE_ENV === "production" || process.env.NETLIFY === "true";
  const cookie = `facilityops_token=; HttpOnly; ${isProd ? "Secure; " : ""}SameSite=Strict; Path=/; Max-Age=0`;

  return ok({ message: "Logged out" }, null, { "Set-Cookie": cookie });
};
