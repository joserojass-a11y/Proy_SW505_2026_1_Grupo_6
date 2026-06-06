import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/authService';
import { profileService } from '../../profile/services/profileService';
import useAppStore from '../../../store/useAppStore';

function LoginRegister() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const showAlert = useAppStore((state) => state.showAlert);
  const setCustomerProfile = useAppStore((state) => state.setCustomerProfile);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerRole, setRegisterRole] = useState('CLIENT'); // 'OWNER' o 'CLIENT'

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegisterMode) {
        await authService.register(authEmail, authPassword, authFullName, registerRole);
        showAlert('Usuario registrado correctamente. Inicia sesión ahora.');
        setIsRegisterMode(false);
      } else {
        const { accessToken } = await authService.login(authEmail, authPassword);
        const decoded = jwtDecode(accessToken);
        const role = decoded.role;
        const id = decoded.sub;
        const email = decoded.email;

        setSession(accessToken, role, id, email);
        showAlert(`Bienvenido ${email}`);

        // Limpiar formularios
        setAuthPassword('');

        if (role === 'CLIENT') {
          // Intentar cargar perfil de cliente
          try {
            const profile = await profileService.fetchCustomerProfile();
            setCustomerProfile(profile);
          } catch (profileErr) {
            console.log('No se encontró perfil de cliente activo.');
            setCustomerProfile(null);
          }
        }
        // Redirigir al inicio/perfil
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Error en la autenticación', 'error');
    }
  };

  return (
    <div className="auth-grid">
      <div className="glass-card auth">
        <h2 className="card-title">
          {isRegisterMode ? 'Registrar una Cuenta' : 'Iniciar Sesión'}
        </h2>
        <form onSubmit={handleAuth} className="form">
          {isRegisterMode && (
            <>
              <div className="form-group">
                <label className="label">Nombre Completo</label>
                <input 
                  type="text" 
                  required 
                  value={authFullName} 
                  onChange={(e) => setAuthFullName(e.target.value)} 
                  className="input" 
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="form-group">
                <label className="label">Rol de Usuario</label>
                <select 
                  value={registerRole} 
                  onChange={(e) => setRegisterRole(e.target.value)} 
                  className="select"
                >
                  <option value="CLIENT">Cliente (Realiza reservas)</option>
                  <option value="OWNER">Propietario de Negocio (Administra empresa)</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label className="label">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              value={authEmail} 
              onChange={(e) => setAuthEmail(e.target.value)} 
              className="input" 
              placeholder="usuario@ejemplo.com"
            />
          </div>
          <div className="form-group">
            <label className="label">Contraseña</label>
            <input 
              type="password" 
              required 
              value={authPassword} 
              onChange={(e) => setAuthPassword(e.target.value)} 
              className="input" 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="submit-btn">
            {isRegisterMode ? 'Registrarse' : 'Ingresar'}
          </button>

          <p className="auth-switch-text">
            {isRegisterMode ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
            <span onClick={() => setIsRegisterMode(!isRegisterMode)} className="auth-switch-link">
              {isRegisterMode ? 'Inicia Sesión' : 'Regístrate aquí'}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginRegister;
