import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';

function Layout() {
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const role = useAppStore((state) => state.role);
  const email = useAppStore((state) => state.email);
  const activeTenant = useAppStore((state) => state.activeTenant);
  const customerProfile = useAppStore((state) => state.customerProfile);
  const alert = useAppStore((state) => state.alert);
  const logout = useAppStore((state) => state.logout);
  const clearAlert = useAppStore((state) => state.clearAlert);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="container">
      {/* --- Encabezado --- */}
      <header className="header">
        <div className="header-title">
          <i className="fa-solid fa-calendar-check logo-icon"></i>
          <div>
            <h1 className="logo-text">UNI Booking Platform</h1>
            <p className="logo-subtext">Sistema de Reserva de Servicios</p>
          </div>
        </div>
        {token ? (
          <div className="user-info">
            <span className="user-badge">{role}</span>
            <span className="user-email">{email}</span>
            <button onClick={handleLogout} className="logout-btn">
              <i className="fa-solid fa-right-from-bracket"></i> Salir
            </button>
          </div>
        ) : (
          <div className="user-info">
            <button onClick={() => navigate('/auth')} className="btn-primary" style={{padding: '8px 16px', fontSize: '14px'}}>
              Iniciar Sesión / Registrarse
            </button>
          </div>
        )}
      </header>

      {/* --- Alerta Global --- */}
      {alert && (
        <div 
          className={`alert ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`}
          onClick={clearAlert}
          style={{ cursor: 'pointer' }}
        >
          <i className={alert.type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'}></i>
          <span>{alert.message}</span>
        </div>
      )}

      {/* --- Navegación (Solo si está autenticado) --- */}
      {token && (
        <nav className="tabs-container">
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
          >
            <i className="fa-solid fa-user-gear"></i> Perfiles y Cuentas
          </NavLink>
          
          {role === 'OWNER' && (
            <button 
              className={`tab-btn ${window.location.pathname === '/config' ? 'active' : ''}`}
              onClick={() => navigate('/config')}
              disabled={!activeTenant}
            >
              <i className="fa-solid fa-sliders"></i> Configuración {activeTenant ? `(${activeTenant.name})` : ''}
            </button>
          )}

          <button 
            className={`tab-btn ${window.location.pathname === '/bookings' ? 'active' : ''}`}
            onClick={() => navigate('/bookings')}
            disabled={role === 'CLIENT' && !customerProfile}
          >
            <i className="fa-solid fa-calendar-days"></i> Reservas
          </button>
        </nav>
      )}

      {/* --- Cuerpo Principal --- */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
