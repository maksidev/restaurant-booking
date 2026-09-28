import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  createTable,
  deleteTable,
  fetchTables,
} from '../features/tables/tablesSlice';
import type { Table } from '../types';
import styles from './ManagerTablesPage.module.css';

export default function ManagerTablesPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.tables);

  const [form, setForm] = useState<Omit<Table, 'id'>>({
    name: '',
    seats: 2,
    zone: 'hall',
    description: '',
  });

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(createTable(form));
    setForm({ name: '', seats: 2, zone: 'hall', description: '' });
  };

  return (
    <div>
      <h1 className={styles.title}>Управление столиками</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          placeholder="Название (например, «Стол №7»)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className={styles.input}
          type="number"
          min={1}
          max={20}
          value={form.seats}
          onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
          placeholder="Мест"
          required
        />
        <select
          className={styles.input}
          value={form.zone}
          onChange={(e) =>
            setForm({ ...form, zone: e.target.value as Table['zone'] })
          }
        >
          <option value="hall">Зал</option>
          <option value="terrace">Веранда</option>
          <option value="vip">VIP</option>
        </select>
        <input
          className={styles.input}
          placeholder="Описание (необязательно)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className={styles.addBtn} type="submit">
          Добавить
        </button>
      </form>

      {loading && <p>Загрузка...</p>}

      <div className={styles.grid}>
        {items.map((table) => (
          <div key={table.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <strong>{table.name}</strong>
              <button
                className={styles.deleteBtn}
                onClick={() => dispatch(deleteTable(table.id))}
                title="Удалить"
              >
                ✕
              </button>
            </div>
            <div className={styles.meta}>
              <span>🪑 {table.seats} мест</span>
              <span className={styles.zone}>
                {table.zone === 'hall' && 'Зал'}
                {table.zone === 'terrace' && 'Веранда'}
                {table.zone === 'vip' && 'VIP'}
              </span>
            </div>
            {table.description && (
              <div className={styles.desc}>{table.description}</div>
            )}
          </div>
        ))}
        {items.length === 0 && !loading && (
          <p>Пока нет столиков. Добавьте первый!</p>
        )}
      </div>
    </div>
  );
}