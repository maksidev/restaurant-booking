import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h1>404 — страница не найдена</h1>
      <Link to="/">← На главную</Link>
    </div>
  );
}