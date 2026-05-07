import { getToken, signOut } from "./auth.js";

const BASE = "/.netlify/functions";
const URLS = {
  tickets:       `${BASE}/tickets`,
  assets:        `${BASE}/assets`,
  maintenance:   `${BASE}/maintenance`,
  vendors:       `${BASE}/vendors`,
  inventory:     `${BASE}/inventory`,
  team:          `${BASE}/team`,
  incidents:     `${BASE}/incidents`,
  documents:     `${BASE}/documents`,
  projects:      `${BASE}/projects`,
  utilities:     `${BASE}/utilities`,
  notifications: `${BASE}/notifications`,
  ai:             `${BASE}/ai`,
  authVerify:     `${BASE}/auth-verify`,
  changePassword: `${BASE}/change-password`,
  tenantSettings: `${BASE}/tenant-settings`,
};

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res, label) {
  if (res.status === 401) {
    signOut();
    window.location.reload();
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(`API ${label} ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || `API ${label} failed`);
  return json.data;
}

export const api = {
  async get(resource) {
    const url = URLS[resource] || resource;
    const res = await fetch(url, { headers: authHeaders() });
    return handleResponse(res, resource);
  },

  async post(resource, body) {
    const url = URLS[resource] || resource;
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body:    JSON.stringify(body),
    });
    return handleResponse(res, `${resource} POST`);
  },

  async put(resource, id, body) {
    const url = URLS[resource] || resource;
    const res = await fetch(`${url}?id=${encodeURIComponent(id)}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body:    JSON.stringify(body),
    });
    return handleResponse(res, `${resource} PUT`);
  },

  async del(resource, id) {
    const url = URLS[resource] || resource;
    const res = await fetch(`${url}?id=${encodeURIComponent(id)}`, {
      method:  "DELETE",
      headers: authHeaders(),
    });
    return handleResponse(res, `${resource} DELETE`);
  },
};
