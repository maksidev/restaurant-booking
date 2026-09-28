import { Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

export default function HomePage() {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Добро пожаловать в ресторан «Уют» 🍷</h1>

      <p style={{ marginBottom: 24, color: '#666', maxWidth: 700 }}>
        Уютный ресторан в центре города. Забронируйте столик онлайн — выберите
        дату, время и зону: основной зал, веранда или VIP.
      </p>

      {!user && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            to="/login"
            style={{
              padding: '10px 20px',
              background: '#c0392b',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            Войти
          </Link>
          <Link
            to="/register"
            style={{
              padding: '10px 20px',
              background: '#fff',
              color: '#c0392b',
              border: '1px solid #c0392b',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            Зарегистрироваться
          </Link>
        </div>
      )}

      {user?.role === 'client' && (
        <Link
          to="/book"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#c0392b',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            marginTop: 8,
          }}
        >
          Забронировать столик →
        </Link>
      )}

      {user?.role === 'manager' && (
        <Link
          to="/manager/bookings"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#c0392b',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            marginTop: 8,
          }}
        >
          Перейти к броням →
        </Link>
      )}
    </div>
  );
}