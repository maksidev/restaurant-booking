import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearError, loginThunk } from '../features/auth/authSlice';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      const role = result.payload.user.role;
      navigate(role === 'manager' ? '/manager/bookings' : '/book');
    }
  };

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Вход</h1>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>

        <label className={styles.label}>
          Пароль
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••"
          />
        </label>

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </button>

        <p className={styles.hint}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>

        <div className={styles.testUsers}>
          <div className={styles.testTitle}>Тестовые аккаунты:</div>
          <div>client@test.ru / 123456 — клиент</div>
          <div>manager@test.ru / 123456 — менеджер</div>
        </div>
      </form>
    </div>
  );
}