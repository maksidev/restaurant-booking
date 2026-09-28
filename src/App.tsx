import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Notifications from './components/Notifications';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ManagerBookingsPage from './pages/ManagerBookingsPage';
import ManagerTablesPage from './pages/ManagerTablesPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <>
      <Notifications />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/book"
            element={
              <PrivateRoute role="client">
                <BookingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <PrivateRoute role="client">
                <MyBookingsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/manager/bookings"
            element={
              <PrivateRoute role="manager">
                <ManagerBookingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager/tables"
            element={
              <PrivateRoute role="manager">
                <ManagerTablesPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}