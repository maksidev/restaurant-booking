import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchBookings,
  updateBookingStatus,
} from '../features/bookings/bookingsSlice';
import type { BookingStatus } from '../types';
import styles from './MyBookingsPage.module.css';

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтверждена',
  rejected: 'Отклонена',
  cancelled: 'Отменена',
};

export default function MyBookingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { items, loading } = useAppSelector((s) => s.bookings);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const myBookings = items
    .filter((b) => b.userId === user?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <h1 className={styles.title}>Мои брони</h1>

      {loading && <p>Загрузка...</p>}

      {!loading && myBookings.length === 0 && (
        <div className={styles.empty}>
          <p>У вас пока нет броней.</p>
          <Link to="/book" className={styles.cta}>
            Забронировать столик →
          </Link>
        </div>
      )}

      <div className={styles.list}>
        {myBookings.map((b) => (
          <div key={b.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <strong className={styles.tableName}>{b.tableName}</strong>
                <span className={`${styles.badge} ${styles[b.status]}`}>
                  {STATUS_LABELS[b.status]}
                </span>
              </div>
              <span className={styles.date}>
                📅 {b.date} в {b.time}
              </span>
            </div>

            <div className={styles.info}>
              <span>🪑 {b.guests} гостей</span>
            </div>

            {b.comment && (
              <div className={styles.comment}>💬 {b.comment}</div>
            )}

            {(b.status === 'pending' || b.status === 'confirmed') && (
              <div className={styles.actions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() =>
                    dispatch(
                      updateBookingStatus({ id: b.id, status: 'cancelled' })
                    )
                  }
                >
                  Отменить бронь
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}