const AUTH_KEY  = "facilityops_user";
const TOKEN_KEY = "facilityops_token";

export async function verifyCredentials(username, password) {
  const res  = await fetch("/.netlify/functions/auth-verify", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ username, password }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || "Invalid credentials.");
  return json.data; // { token, user: { id, name, email, role, initials, dept } }
}

export function saveSession({ token, user }) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user.email || !user.role) return null;
    return user;
  } catch { return null; }
}

export async function signOut() {
  localStorage.removeItem(AUTH_KEY);
  try {
    await fetch("/.netlify/functions/auth-logout", { method: "POST" });
  } catch (e) {
    console.error("Logout error", e);
  }
}
