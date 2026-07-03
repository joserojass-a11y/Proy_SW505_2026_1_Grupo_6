import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../shared/components/Layout';
import LoginRegister from '../features/auth/components/LoginRegister';
import ProfilePage from '../features/profile/components/ProfilePage';
import ConfigPage from '../features/booking/components/ConfigPage';
import BookingsPage from '../features/booking/components/BookingsPage';
import ServiceSearchPage from '../features/search/components/ServiceSearchPage';
import CreateServiceOptions from '../features/services/components/CreateServiceOptions';
import CreateServiceIndependent from '../features/services/components/CreateServiceIndependent';
import CreateServiceCompany from '../features/services/components/CreateServiceCompany';
import useAppStore from '../store/useAppStore';

// Componente para proteger rutas privadas
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = useAppStore((state) => state.token);
  const role = useAppStore((state) => state.role);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente para evitar acceso a la página de login si ya hay sesión activa
const GuestRoute = ({ children }) => {
  const token = useAppStore((state) => state.token);
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root layout always lands on public explorer */}
        <Route path="/" element={<Layout />}>
          {/* Public Home Page */}
          <Route index element={<ServiceSearchPage />} />
          <Route path="home" element={<Navigate to="/" replace />} />

          {/* Create Service Routes (Protected) */}
          <Route
            path="create-service"
            element={
              <ProtectedRoute>
                <CreateServiceOptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="create-service/independent"
            element={
              <ProtectedRoute>
                <CreateServiceIndependent />
              </ProtectedRoute>
            }
          />
          <Route
            path="create-service/company"
            element={
              <ProtectedRoute>
                <CreateServiceCompany />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="config" 
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <ConfigPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="bookings" 
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="auth" 
            element={
              <GuestRoute>
                <LoginRegister />
              </GuestRoute>
            } 
          />
          <Route path="login" element={<Navigate to="/auth" replace />} />
          {/* Redirección por defecto para cualquier otra ruta */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
