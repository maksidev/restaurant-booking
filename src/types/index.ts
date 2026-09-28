// Роли пользователей
export type UserRole = 'client' | 'manager';

// Пользователь
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Столик в ресторане
export interface Table {
  id: string;
  name: string;                        // "Стол №1"
  seats: number;                       // вместимость
  zone: 'hall' | 'terrace' | 'vip';    // зона
  description?: string;                // необязательное поле
}

// Статус брони
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

// Бронь
export interface Booking {
  id: string;
  userId: string;
  userName: string;
  tableId: string;
  tableName: string;
  date: string;          // "2025-06-15"
  time: string;          // "19:00"
  guests: number;
  comment?: string;
  status: BookingStatus;
  createdAt: string;
}

// Сообщение в чате (для WebSocket)
export interface ChatMessage {
  id: string;
  from: string;
  fromName: string;
  text: string;
  createdAt: string;
}

// Данные для входа/регистрации
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}