import type {
  Booking,
  LoginPayload,
  RegisterPayload,
  Table,
  User,
} from '../types';

// ============================================
// Ключи для localStorage
// ============================================
const KEYS = {
  users: 'rb_users',
  tables: 'rb_tables',
  bookings: 'rb_bookings',
  token: 'rb_token',
} as const;

// ============================================
// Утилита: искусственная задержка (имитация сети)
// ============================================
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ============================================
// Утилита: чтение/запись в localStorage
// ============================================
function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ============================================
// Начальные данные (если база пуста — заполним)
// ============================================
const defaultTables: Table[] = [
  { id: 't1', name: 'Стол №1', seats: 2, zone: 'hall',    description: 'У окна' },
  { id: 't2', name: 'Стол №2', seats: 4, zone: 'hall',    description: 'В центре зала' },
  { id: 't3', name: 'Стол №3', seats: 6, zone: 'hall' },
  { id: 't4', name: 'Стол №4', seats: 4, zone: 'terrace', description: 'На веранде' },
  { id: 't5', name: 'Стол №5', seats: 2, zone: 'terrace' },
  { id: 't6', name: 'Стол №6', seats: 8, zone: 'vip',     description: 'VIP-зал' },
];

function seedIfEmpty() {
  if (!localStorage.getItem(KEYS.tables)) {
    write(KEYS.tables, defaultTables);
  }
  // Создадим двух пользователей по умолчанию (клиент + менеджер)
  if (!localStorage.getItem(KEYS.users)) {
    const users: (User & { password: string })[] = [
      {
        id: 'u1',
        email: 'client@test.ru',
        name: 'Иван (клиент)',
        role: 'client',
        password: '123456',
      },
      {
        id: 'u2',
        email: 'manager@test.ru',
        name: 'Мария (менеджер)',
        role: 'manager',
        password: '123456',
      },
    ];
    write(KEYS.users, users);
  }
  if (!localStorage.getItem(KEYS.bookings)) {
    write(KEYS.bookings, []);
  }
}

// Инициализация при первом импорте
seedIfEmpty();

// ============================================
// API: аутентификация
// ============================================
export async function apiLogin(payload: LoginPayload): Promise<{ user: User; token: string }> {
  await delay();
  const users = read<(User & { password: string })[]>(KEYS.users, []);
  const found = users.find(
    (u) => u.email === payload.email && u.password === payload.password
  );
  if (!found) {
    throw new Error('Неверный email или пароль');
  }
  const { password: _pw, ...user } = found;
  const token = `mock-jwt-${user.id}-${Date.now()}`;
  write(KEYS.token, token);
  return { user, token };
}

export async function apiRegister(
  payload: RegisterPayload
): Promise<{ user: User; token: string }> {
  await delay();
  const users = read<(User & { password: string })[]>(KEYS.users, []);
  if (users.some((u) => u.email === payload.email)) {
    throw new Error('Пользователь с таким email уже существует');
  }
  const newUser: User & { password: string } = {
    id: `u${Date.now()}`,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    password: payload.password,
  };
  users.push(newUser);
  write(KEYS.users, users);
  const { password: _pw, ...user } = newUser;
  const token = `mock-jwt-${user.id}-${Date.now()}`;
  write(KEYS.token, token);
  return { user, token };
}

export function apiGetToken(): string | null {
  return read<string | null>(KEYS.token, null);
}

// Восстановление пользователя по токену (для F5)
export function apiGetCurrentUser(): User | null {
  const token = read<string | null>(KEYS.token, null);
  if (!token) return null;
  // Наш мок-токен формата "mock-jwt-u1-1712345678901"
  // Достаём из него id пользователя
  const parts = token.split('-');
  if (parts.length < 4) return null;
  const userId = parts[2]; // третий элемент — id
  const users = read<(User & { password: string })[]>(KEYS.users, []);
  const found = users.find((u) => u.id === userId);
  if (!found) return null;
  const { password: _pw, ...user } = found;
  return user;
}

export function apiLogout(): void {
  localStorage.removeItem(KEYS.token);
}

// ============================================
// API: столики
// ============================================
export async function apiGetTables(): Promise<Table[]> {
  await delay();
  return read<Table[]>(KEYS.tables, []);
}

export async function apiCreateTable(table: Omit<Table, 'id'>): Promise<Table> {
  await delay();
  const tables = read<Table[]>(KEYS.tables, []);
  const newTable: Table = { ...table, id: `t${Date.now()}` };
  tables.push(newTable);
  write(KEYS.tables, tables);
  return newTable;
}

export async function apiDeleteTable(id: string): Promise<void> {
  await delay();
  const tables = read<Table[]>(KEYS.tables, []).filter((t) => t.id !== id);
  write(KEYS.tables, tables);
}

// ============================================
// API: брони
// ============================================
export async function apiGetBookings(): Promise<Booking[]> {
  await delay();
  return read<Booking[]>(KEYS.bookings, []);
}

export async function apiCreateBooking(
  booking: Omit<Booking, 'id' | 'createdAt' | 'status'>
): Promise<Booking> {
  await delay();
  const bookings = read<Booking[]>(KEYS.bookings, []);
  const newBooking: Booking = {
    ...booking,
    id: `b${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  write(KEYS.bookings, bookings);
  return newBooking;
}

export async function apiUpdateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<Booking> {
  await delay();
  const bookings = read<Booking[]>(KEYS.bookings, []);
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error('Бронь не найдена');
  bookings[idx] = { ...bookings[idx], status };
  write(KEYS.bookings, bookings);
  return bookings[idx];
}