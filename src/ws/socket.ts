let socket: WebSocket | null = null;
const listeners = new Set<(data: unknown) => void>();

export function connectSocket(user: {
  id: string;
  name: string;
  role: string;
}) {
  if (socket && socket.readyState <= 1) return socket;

  socket = new WebSocket('ws://localhost:8081');

  socket.onopen = () => {
    console.log('[WS] Подключено');
    socket?.send(
      JSON.stringify({
        type: 'register',
        userId: user.id,
        userName: user.name,
        role: user.role,
      })
    );
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      listeners.forEach((fn) => fn(data));
    } catch {
      /* ignore */
    }
  };

  socket.onclose = () => {
    console.log('[WS] Отключено');
    socket = null;
  };

  return socket;
}

export function disconnectSocket() {
  socket?.close();
  socket = null;
}

export function sendSocket(data: unknown) {
  if (socket && socket.readyState === 1) {
    socket.send(JSON.stringify(data));
  }
}

export function onSocketMessage(fn: (data: unknown) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}