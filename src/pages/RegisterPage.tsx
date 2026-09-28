import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearError, registerThunk } from '../features/auth/authSlice';
import type { UserRole } from '../types';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(registerThunk({ name, email, password, role }));
    if (registerThunk.fulfilled.match(result)) {
      navigate(role === 'manager' ? '/manager/bookings' : '/book');
    }
  };

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Регистрация</h1>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>
          Имя
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Как вас зовут?"
          />
        </label>

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
            minLength={6}
            placeholder="Минимум 6 символов"
          />
        </label>

        <label className={styles.label}>
          Роль
          <select
            className={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="client">Клиент</option>
            <option value="manager">Менеджер</option>
          </select>
        </label>

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Создаём...' : 'Зарегистрироваться'}
        </button>

        <p className={styles.hint}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}