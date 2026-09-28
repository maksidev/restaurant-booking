import { WebSocketServer } from 'ws';
import http from 'http';

const HTTP_PORT = 8080;
const WS_PORT = 8081;

const db = {
  users: [
    { id: 'u1', email: 'client@test.ru', password: '123456', name: 'Иван (клиент)', role: 'client' },
    { id: 'u2', email: 'manager@test.ru', password: '123456', name: 'Мария (менеджер)', role: 'manager' },
  ],
  tables: [
    { id: 't1', name: 'Стол №1', seats: 2, zone: 'hall', description: 'У окна' },
    { id: 't2', name: 'Стол №2', seats: 4, zone: 'hall', description: 'В центре зала' },
    { id: 't3', name: 'Стол №3', seats: 6, zone: 'hall' },
    { id: 't4', name: 'Стол №4', seats: 4, zone: 'terrace', description: 'На веранде' },
    { id: 't5', name: 'Стол №5', seats: 2, zone: 'terrace' },
    { id: 't6', name: 'Стол №6', seats: 8, zone: 'vip', description: 'VIP-зал' },
  ],
  bookings: [],
};

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function makeId(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${HTTP_PORT}`);
  const path = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') return sendJson(res, 200, {});

  if (path === '/api/login' && method === 'POST') {
    const body = await parseBody(req);
    const user = db.users.find(
      (u) => u.email === body.email && u.password === body.password
    );
    if (!user) return sendJson(res, 401, { error: 'Неверный email или пароль' });
    const { password, ...safeUser } = user;
    const token = `mock-jwt-${user.id}-${Date.now()}`;
    return sendJson(res, 200, { user: safeUser, token });
  }

  if (path === '/api/register' && method === 'POST') {
    const body = await parseBody(req);
    if (db.users.some((u) => u.email === body.email)) {
      return sendJson(res, 400, { error: 'Пользователь с таким email уже существует' });
    }
    const newUser = {
      id: makeId('u'),
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role || 'client',
    };
    db.users.push(newUser);
    const { password, ...safeUser } = newUser;
    const token = `mock-jwt-${newUser.id}-${Date.now()}`;
    return sendJson(res, 200, { user: safeUser, token });
  }

  if (path === '/api/me' && method === 'GET') {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    const parts = token.split('-');
    if (parts.length < 4) return sendJson(res, 401, { error: 'No auth' });
    const userId = parts[2];
    const user = db.users.find((u) => u.id === userId);
    if (!user) return sendJson(res, 401, { error: 'User not found' });
    const { password, ...safeUser } = user;
    return sendJson(res, 200, safeUser);
  }

  if (path === '/api/tables' && method === 'GET') {
    return sendJson(res, 200, db.tables);
  }

  if (path === '/api/tables' && method === 'POST') {
    const body = await parseBody(req);
    const newTable = { ...body, id: makeId('t') };
    db.tables.push(newTable);
    return sendJson(res, 200, newTable);
  }

  if (path.startsWith('/api/tables/') && method === 'DELETE') {
    const id = path.replace('/api/tables/', '');
    db.tables = db.tables.filter((t) => t.id !== id);
    return sendJson(res, 200, { ok: true });
  }

  if (path === '/api/bookings' && method === 'GET') {
    return sendJson(res, 200, db.bookings);
  }

  if (path === '/api/bookings' && method === 'POST') {
    const body = await parseBody(req);
    const newBooking = {
      ...body,
      id: makeId('b'),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    db.bookings.push(newBooking);
    return sendJson(res, 200, newBooking);
  }

  if (path.startsWith('/api/bookings/') && method === 'PATCH') {
    const id = path.replace('/api/bookings/', '');
    const body = await parseBody(req);
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return sendJson(res, 404, { error: 'Not found' });
    db.bookings[idx] = { ...db.bookings[idx], ...body };
    return sendJson(res, 200, db.bookings[idx]);
  }

  sendJson(res, 404, { error: 'Not found', path, method });
});

server.listen(HTTP_PORT, () => {
  console.log(`[API] HTTP-сервер запущен на http://localhost:${HTTP_PORT}`);
});

const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Set();

console.log(`[WS] WebSocket-сервер запущен на ws://localhost:${WS_PORT}`);

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'register') {
      ws.userId = msg.userId;
      ws.userName = msg.userName;
      ws.role = msg.role;
      clients.add(ws);
      console.log(`[WS] Зарегистрирован: ${msg.userName} (${msg.role})`);
      return;
    }

    if (msg.type === 'booking_status' || msg.type === 'new_booking' || msg.type === 'chat') {
      const payload = JSON.stringify({ ...msg, fromName: ws.userName });
      clients.forEach((client) => {
        if (client.readyState === 1) client.send(payload);
      });
    }
  });

  ws.on('close', () => clients.delete(ws));
});