import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  apiCreateBooking,
  apiGetBookings,
  apiUpdateBookingStatus,
} from '../../api/api';
import type { Booking } from '../../types';

interface BookingsState {
  items: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk('bookings/fetchAll', async () => {
  return await apiGetBookings();
});

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    return await apiCreateBooking(booking);
  }
);

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateStatus',
  async ({ id, status }: { id: string; status: Booking['status'] }) => {
    return await apiUpdateBookingStatus(id, status);
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Ошибка загрузки броней';
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default bookingsSlice.reducer;