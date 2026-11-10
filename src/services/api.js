const API_URL = import.meta.env.VITE_API_URL;

export async function api(action, payload = {}) {
  if (!API_URL) return { ok: false, error: "no_api_url" };
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      // text/plain avoids the CORS preflight that Apps Script cannot answer
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...payload }),
    });
    return await res.json();
  } catch {
    return { ok: false, error: "network" };
  }
}