import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import tablesReducer from '../features/tables/tablesSlice';
import bookingsReducer from '../features/bookings/bookingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tables: tablesReducer,
    bookings: bookingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;