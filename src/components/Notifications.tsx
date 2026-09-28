import { useEffect, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { connectSocket, disconnectSocket, onSocketMessage } from '../ws/socket';
import styles from './Notifications.module.css';

interface Toast {
  id: string;
  text: string;
}

export default function Notifications() {
  const { user } = useAppSelector((s) => s.auth);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Подключаемся, когда пользователь вошёл
  useEffect(() => {
    if (!user) return;
    connectSocket({ id: user.id, name: user.name, role: user.role });

    const off = onSocketMessage((raw) => {
      const data = raw as { type?: string; booking?: { tableName: string; status: string } };
      if (data.type === 'booking_status' && data.booking) {
        const status = data.booking.status;
        const statusText =
          status === 'confirmed'
            ? 'подтверждена ✅'
            : status === 'rejected'
              ? 'отклонена ❌'
              : status === 'cancelled'
                ? 'отменена'
                : 'обновлена';
        const text = `Бронь «${data.booking.tableName}» ${statusText}`;
        const id = `t${Date.now()}`;
        setToasts((prev) => [...prev, { id, text }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
      }
    });

    return () => {
      off();
      disconnectSocket();
    };
  }, [user]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast}>
          🔔 {t.text}
        </div>
      ))}
    </div>
  );
}