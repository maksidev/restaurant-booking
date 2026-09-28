import type {
  Booking,
  LoginPayload,
  RegisterPayload,
  Table,
  User,
} from '../types';

const API_URL = 'http://localhost:8080/api';
const TOKEN_KEY = 'rb_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Ошибка запроса');
  return data as T;
}

export async function apiLogin(
  payload: LoginPayload
): Promise<{ user: User; token: string }> {
  const res = await request<{ user: User; token: string }>('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setToken(res.token);
  return res;
}

export async function apiRegister(
  payload: RegisterPayload
): Promise<{ user: User; token: string }> {
  const res = await request<{ user: User; token: string }>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setToken(res.token);
  return res;
}

export function apiLogout() {
  setToken(null);
}

export async function apiGetCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  try {
    return await request<User>('/me');
  } catch {
    setToken(null);
    return null;
  }
}

export function apiGetTables(): Promise<Table[]> {
  return request<Table[]>('/tables');
}

export function apiCreateTable(table: Omit<Table, 'id'>): Promise<Table> {
  return request<Table>('/tables', {
    method: 'POST',
    body: JSON.stringify(table),
  });
}

export function apiDeleteTable(id: string): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/tables/${id}`, { method: 'DELETE' });
}

export function apiGetBookings(): Promise<Booking[]> {
  return request<Booking[]>('/bookings');
}

export function apiCreateBooking(
  booking: Omit<Booking, 'id' | 'createdAt' | 'status'>
): Promise<Booking> {
  return request<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  });
}

export function apiUpdateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<Booking> {
  return request<Booking>(`/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}