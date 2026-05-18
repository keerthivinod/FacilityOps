const { ok, fail, preflight } = require("./lib/respond");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      console.log("Received push subscription:", body);
      // Currently a stub. In the future, this should save the subscription to a database table.
      return ok({ status: "success", message: "Push subscription received." });
    } catch (e) {
      console.error("push-subscriptions error:", e.message);
      return fail(500, "Server error");
    }
  }

  return fail(405, "Method not allowed");
};
