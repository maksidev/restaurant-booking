import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  apiCreateTable,
  apiDeleteTable,
  apiGetTables,
} from '../../api/api';
import type { Table } from '../../types';

interface TablesState {
  items: Table[];
  loading: boolean;
  error: string | null;
}

const initialState: TablesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTables = createAsyncThunk('tables/fetchAll', async () => {
  return await apiGetTables();
});

export const createTable = createAsyncThunk(
  'tables/create',
  async (table: Omit<Table, 'id'>) => {
    return await apiCreateTable(table);
  }
);

export const deleteTable = createAsyncThunk(
  'tables/delete',
  async (id: string) => {
    await apiDeleteTable(id);
    return id;
  }
);

const tablesSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Ошибка загрузки столиков';
      })
      .addCase(createTable.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export default tablesSlice.reducer;