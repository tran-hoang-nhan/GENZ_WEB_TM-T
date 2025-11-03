const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

type FetchOptions = RequestInit & { query?: Record<string, string | number | boolean> };

function buildUrl(path: string, query?: Record<string, string | number | boolean>) {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  const urlString = API_BASE + normalizedPath;
  const url = new URL(urlString);
  if (query) {
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  return url.toString();
}

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const url = buildUrl(path, options.query);
  const headers: Record<string, string> = {};
  if (options.headers) Object.assign(headers, options.headers as Record<string, string>);
  // No auth token for public endpoints

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function apiFetchAuth(path: string, options: FetchOptions = {}) {
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
  list: () => apiFetchAuth('products'),
  create: (payload: any) => apiFetchAuth('products', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
};

export const auth = {
  register: (payload: any) => apiFetch('auth/register', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  login: (payload: any) => apiFetch('auth/login', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  updateProfile: (payload: any) => apiFetchAuth('auth/profile', { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
};

export const orders = {
  list: () => apiFetchAuth('orders'),
  get: (id: string) => apiFetchAuth(`orders/${id}`),
  create: (payload: any) => apiFetchAuth('orders', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } }),
  updateStatus: (id: string, status: string) => apiFetchAuth(`orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }), headers: { 'Content-Type': 'application/json' } })
}

export const payments = {
  create: (payload: any) => apiFetchAuth('payments', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
}
