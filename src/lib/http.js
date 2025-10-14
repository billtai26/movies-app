/**
 * Simple fetch wrapper.
 * Usage: apiGet('/movies/popular', { page: 1 })
 * Reads base URL from VITE_API_BASE_URL. If not set, you can pass absolute URLs.
 */
export async function apiGet(path, params = {}) {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  const url = new URL(path, base || window.location.origin);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
