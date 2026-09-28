import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  apiGetCurrentUser,
  apiLogin,
  apiLogout,
  apiRegister,
  getToken,
} from '../../api/api';
import type { LoginPayload, RegisterPayload, User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: getToken(),
  loading: false,
  error: null,
  initialized: false,
};

export const loadUserThunk = createAsyncThunk('auth/loadUser', async () => {
  return await apiGetCurrentUser();
});

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      return await apiLogin(payload);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      return await apiRegister(payload);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      apiLogout();
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(loadUserThunk.rejected, (state) => {
        state.user = null;
        state.initialized = true;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Ошибка входа';
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Ошибка регистрации';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;