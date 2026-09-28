import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  role?: UserRole;
}

export default function PrivateRoute({ children, role }: Props) {
  const { user, initialized } = useAppSelector((s) => s.auth);

  // Пока не знаем, залогинен ли пользователь — показываем загрузку
  if (!initialized) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>
        Загрузка...
      </div>
    );
  }

  // Не залогинен — на страницу входа
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Если указана нужная роль, а у пользователя другая — на главную
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}