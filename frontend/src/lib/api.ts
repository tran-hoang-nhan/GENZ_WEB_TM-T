const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

type FetchOptions = RequestInit & { query?: Record<string, string | number | boolean> };

function buildUrl(path: string, query?: Record<string, string | number | boolean>) {
  const url = new URL(path, API_BASE);
  if (query) {
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  return url.toString();
}

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const url = buildUrl(path, options.query);
  const headers: Record<string, string> = {};
  if (options.headers) Object.assign(headers, options.headers as Record<string, string>);
  // Add auth token if present
  const token = localStorage.getItem('genz_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export const products = {
  list: () => apiFetch('/products'),
  create: (payload: any) => apiFetch('/products', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
};

export const auth = {
  register: (payload: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  login: (payload: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
};

export const orders = {
  list: () => apiFetch('/orders'),
  get: (id: string) => apiFetch(`/orders/${id}`),
  updateStatus: (id: string, status: string) => apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), headers: { 'Content-Type': 'application/json' } })
}
