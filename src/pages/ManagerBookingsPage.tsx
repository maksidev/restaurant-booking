import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchBookings,
  updateBookingStatus,
} from '../features/bookings/bookingsSlice';
import { sendSocket } from '../ws/socket';
import type { BookingStatus } from '../types';
import styles from './ManagerBookingsPage.module.css';

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждена',
  rejected: 'Отклонена',
  cancelled: 'Отменена',
};

export default function ManagerBookingsPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.bookings);

  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const filtered =
    filter === 'all' ? items : items.filter((b) => b.status === filter);

  const sorted = [...filtered].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return (
    <div>
      <h1 className={styles.title}>Все брони</h1>

      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          Все ({items.length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
          onClick={() => setFilter('pending')}
        >
          Ожидают ({items.filter((b) => b.status === 'pending').length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'confirmed' ? styles.active : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Подтверждены ({items.filter((b) => b.status === 'confirmed').length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'rejected' ? styles.active : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Отклонены ({items.filter((b) => b.status === 'rejected').length})
        </button>
      </div>

      {loading && <p>Загрузка...</p>}

      {!loading && sorted.length === 0 && (
        <p className={styles.empty}>Броней пока нет.</p>
      )}

      <div className={styles.list}>
        {sorted.map((b) => (
          <div key={b.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <strong>{b.tableName}</strong>
                <span className={styles.badge + ' ' + styles[b.status]}>
                  {STATUS_LABELS[b.status]}
                </span>
              </div>
              <span className={styles.date}>
                {b.date} в {b.time}
              </span>
            </div>
            <div className={styles.info}>
              <span>👤 {b.userName}</span>
              <span>🪑 {b.guests} гостей</span>
            </div>
            {b.comment && <div className={styles.comment}>💬 {b.comment}</div>}

            {b.status === 'pending' && (
              <div className={styles.actions}>
                <button
  className={styles.confirmBtn}
  onClick={async () => {
    const res = await dispatch(
      updateBookingStatus({ id: b.id, status: 'confirmed' })
    );
    if (updateBookingStatus.fulfilled.match(res)) {
      sendSocket({
        type: 'booking_status',
        booking: { ...b, status: 'confirmed' },
      });
    }
  }}
>
  ✓ Подтвердить
</button>
                <button
  className={styles.rejectBtn}
  onClick={async () => {
    const res = await dispatch(
      updateBookingStatus({ id: b.id, status: 'rejected' })
    );
    if (updateBookingStatus.fulfilled.match(res)) {
      sendSocket({
        type: 'booking_status',
        booking: { ...b, status: 'rejected' },
      });
    }
  }}
>
  ✕ Отклонить
</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}