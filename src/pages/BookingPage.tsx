import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTables } from '../features/tables/tablesSlice';
import { createBooking } from '../features/bookings/bookingsSlice';
import type { Table } from '../types';
import styles from './BookingPage.module.css';

const step1Schema = z.object({
  date: z.string().min(1, 'Выберите дату'),
  time: z
    .string()
    .min(1, 'Выберите время')
    .regex(/^\d{2}:\d{2}$/, 'Формат ЧЧ:ММ'),
  guests: z
    .number({ message: 'Введите число' })
    .int('Целое число')
    .min(1, 'Минимум 1 гость')
    .max(20, 'Максимум 20 гостей'),
});

const step2Schema = z.object({
  tableId: z.string().min(1, 'Выберите столик'),
});

const step3Schema = z.object({
  comment: z.string().max(300, 'Не более 300 символов').optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const ZONE_LABELS: Record<Table['zone'], string> = {
  hall: 'Зал',
  terrace: 'Веранда',
  vip: 'VIP',
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const { items: tables } = useAppSelector((s) => s.tables);

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { date: '', time: '19:00', guests: 2 },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { tableId: '' },
  });

  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { comment: '' },
  });

  const onStep1 = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2 = (data: Step2Data) => {
    setStep2Data(data);
    setStep(3);
  };

  const onStep3 = async (data: Step3Data) => {
    if (!user || !step1Data || !step2Data) return;

    const table = tables.find((t) => t.id === step2Data.tableId);
    if (!table) return;

    const result = await dispatch(
      createBooking({
        userId: user.id,
        userName: user.name,
        tableId: table.id,
        tableName: table.name,
        date: step1Data.date,
        time: step1Data.time,
        guests: step1Data.guests,
        comment: data.comment,
      })
    );

    if (createBooking.fulfilled.match(result)) {
      navigate('/my-bookings');
    }
  };

  const guestsFiltered = step1Data
    ? tables.filter((t) => t.seats >= (step1Data.guests ?? 1))
    : tables;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Бронирование столика</h1>

      <div className={styles.steps}>
        <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>1</span> Дата и время
        </div>
        <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>2</span> Столик
        </div>
        <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>3</span> Подтверждение
        </div>
      </div>

      {step === 1 && (
        <form className={styles.card} onSubmit={form1.handleSubmit(onStep1)}>
          <label className={styles.label}>
            Дата *
            <input
              type="date"
              className={styles.input}
              min={new Date().toISOString().split('T')[0]}
              {...form1.register('date')}
            />
            {form1.formState.errors.date && (
              <span className={styles.error}>
                {form1.formState.errors.date.message}
              </span>
            )}
          </label>

          <label className={styles.label}>
            Время *
            <input
              type="time"
              className={styles.input}
              {...form1.register('time')}
            />
            {form1.formState.errors.time && (
              <span className={styles.error}>
                {form1.formState.errors.time.message}
              </span>
            )}
          </label>

          <label className={styles.label}>
            Количество гостей *
            <input
              type="number"
              className={styles.input}
              min={1}
              max={20}
              {...form1.register('guests', { valueAsNumber: true })}
            />
            {form1.formState.errors.guests && (
              <span className={styles.error}>
                {form1.formState.errors.guests.message}
              </span>
            )}
          </label>

          <button className={styles.nextBtn} type="submit">
            Далее →
          </button>
        </form>
      )}

      {step === 2 && step1Data && (
        <form className={styles.card} onSubmit={form2.handleSubmit(onStep2)}>
          <p className={styles.hint}>
            Столики, подходящие под {step1Data.guests} гостей:
          </p>

          {guestsFiltered.length === 0 && (
            <p className={styles.empty}>
              Нет столиков с такой вместимостью. Вернитесь назад.
            </p>
          )}

          <div className={styles.tables}>
            {guestsFiltered.map((t) => (
              <label
                key={t.id}
                className={`${styles.tableCard} ${
                  form2.watch('tableId') === t.id ? styles.tableSelected : ''
                }`}
              >
                <input
                  type="radio"
                  value={t.id}
                  {...form2.register('tableId')}
                  hidden
                />
                <div className={styles.tableName}>{t.name}</div>
                <div className={styles.tableMeta}>
                  🪑 {t.seats} мест · {ZONE_LABELS[t.zone]}
                </div>
                {t.description && (
                  <div className={styles.tableDesc}>{t.description}</div>
                )}
              </label>
            ))}
          </div>

          {form2.formState.errors.tableId && (
            <span className={styles.error}>
              {form2.formState.errors.tableId.message}
            </span>
          )}

          <div className={styles.buttonsRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setStep(1)}
            >
              ← Назад
            </button>
            <button className={styles.nextBtn} type="submit">
              Далее →
            </button>
          </div>
        </form>
      )}

      {step === 3 && step1Data && step2Data && (
        <form className={styles.card} onSubmit={form3.handleSubmit(onStep3)}>
          <div className={styles.summary}>
            <div className={styles.summaryTitle}>Проверьте бронь:</div>
            <div className={styles.summaryRow}>
              <span>Дата:</span> <strong>{step1Data.date}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Время:</span> <strong>{step1Data.time}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Гостей:</span> <strong>{step1Data.guests}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Столик:</span>{' '}
              <strong>
                {tables.find((t) => t.id === step2Data.tableId)?.name}
              </strong>
            </div>
          </div>

          <label className={styles.label}>
            Комментарий (необязательно)
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Пожелания, особые случаи..."
              {...form3.register('comment')}
            />
            {form3.formState.errors.comment && (
              <span className={styles.error}>
                {form3.formState.errors.comment.message}
              </span>
            )}
          </label>

          <div className={styles.buttonsRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setStep(2)}
            >
              ← Назад
            </button>
            <button className={styles.submitBtn} type="submit">
              Забронировать ✓
            </button>
          </div>
        </form>
      )}
    </div>
  );
}