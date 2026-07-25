// API клиент для админ-панели
const API_URL = 'https://localhost:3000/api';

let adminToken: string | null = localStorage.getItem('adminToken');

export function setAdminToken(token: string | null) {
  adminToken = token;
  if (token) localStorage.setItem('adminToken', token);
  else localStorage.removeItem('adminToken');
}

export function getAdminToken() {
  return adminToken;
}

async function request<T = any>(path: string, options: { method?: string; body?: any } = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

export const adminApi = {
  login: (phone: string, code: string) =>
    request('/auth/admin-login', { method: 'POST', body: { phone, code } }),

  getStats: () => request('/admin/stats'),
  getUsers: (page = 1) => request(`/admin/users?page=${page}`),
  blockUser: (id: string, block: boolean) =>
    request(`/admin/users/${id}/block`, { method: 'PUT', body: { block } }),
  setUserRole: (id: string, role: string) =>
    request(`/admin/users/${id}/role`, { method: 'PUT', body: { role } }),
  deleteUser: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),

  getProducts: (page = 1) => request(`/admin/products?page=${page}`),
  setProductStatus: (id: string, status: string) =>
    request(`/admin/products/${id}/status`, { method: 'PUT', body: { status } }),
  deleteProduct: (id: string) => request(`/admin/products/${id}`, { method: 'DELETE' }),
};
