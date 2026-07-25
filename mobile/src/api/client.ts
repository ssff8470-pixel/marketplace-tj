import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

let authToken: string | null = null;

export async function setToken(token: string | null) {
  authToken = token;
  if (token) {
    await AsyncStorage.setItem('token', token);
  } else {
    await AsyncStorage.removeItem('token');
  }
}

export async function loadToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem('token');
  authToken = token;
  return token;
}

async function request<T = any>(
  path: string,
  options: { method?: string; body?: any; auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.auth !== false && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Игнорируем ошибки SSL в локальной разработке
  // (React Native / Expo по умолчанию не доверяет самоподписанным сертификатам)
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }

  return data;
}

// === Auth ===
export const api = {
  sendCode: (phone: string) =>
    request('/auth/send-code', { method: 'POST', body: { phone }, auth: false }),

  verifyCode: (phone: string, code: string) =>
    request('/auth/verify-code', { method: 'POST', body: { phone, code }, auth: false }),

  adminLogin: (phone: string, code: string) =>
    request('/auth/admin-login', { method: 'POST', body: { phone, code }, auth: false }),

  getMe: () => request('/auth/me'),

  updateProfile: (name: string) =>
    request('/auth/profile', { method: 'PUT', body: { name } }),

  // === Products ===
  getProducts: (params: { page?: number; category?: string; search?: string; userId?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.category && params.category !== 'all') qs.set('category', params.category);
    if (params.search) qs.set('search', params.search);
    if (params.userId) qs.set('userId', params.userId);
    return request(`/products?${qs.toString()}`);
  },

  getProduct: (id: string) => request(`/products/${id}`),

  createProduct: (data: { title: string; description: string; price: number; category: string; imageUrl?: string }) =>
    request('/products', { method: 'POST', body: data }),

  updateProduct: (id: string, data: any) =>
    request(`/products/${id}`, { method: 'PUT', body: data }),

  deleteProduct: (id: string) =>
    request(`/products/${id}`, { method: 'DELETE' }),

  getMyProducts: () => request('/products/my/listing'),

  toggleFavorite: (id: string, add: boolean) =>
    request(`/products/${id}/favorite`, { method: add ? 'POST' : 'DELETE' }),

  getFavorites: () => request('/products/favorites/my'),
};
