import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import styles from './Layout.module.css';

export default function Layout() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            🍽 Ресторан «Уют»
          </Link>

          <nav className={styles.nav}>
            <NavLink to="/" className={styles.navLink} end>
              Главная
            </NavLink>

            {user?.role === 'client' && (
              <>
                <NavLink to="/book" className={styles.navLink}>
                  Забронировать
                </NavLink>
                <NavLink to="/my-bookings" className={styles.navLink}>
                  Мои брони
                </NavLink>
              </>
            )}

            {user?.role === 'manager' && (
              <>
                <NavLink to="/manager/bookings" className={styles.navLink}>
                  Все брони
                </NavLink>
                <NavLink to="/manager/tables" className={styles.navLink}>
                  Столики
                </NavLink>
              </>
            )}
          </nav>

          <div className={styles.userBlock}>
            {user ? (
              <>
                <span className={styles.userName}>
                  {user.name} <small>({user.role === 'manager' ? 'менеджер' : 'клиент'})</small>
                </span>
                <button
                  className={styles.logoutBtn}
                  onClick={() => dispatch(logout())}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.navLink}>Вход</Link>
                <Link to="/register" className={styles.navLink}>Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          © 2025 Ресторан «Уют». Учебный проект.
        </div>
      </footer>
    </div>
  );
}