import React, { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import useAppStore from '../../../store/useAppStore';

function CustomerProfile() {
  const customerProfile = useAppStore((state) => state.customerProfile);
  const setCustomerProfile = useAppStore((state) => state.setCustomerProfile);
  const email = useAppStore((state) => state.email);
  const tenants = useAppStore((state) => state.tenants);
  const showAlert = useAppStore((state) => state.showAlert);

  const [bookTenantId, setBookTenantId] = useState('');
  const [custFirstName, setCustFirstName] = useState('');
  const [custLastName, setCustLastName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custTimezone, setCustTimezone] = useState('America/Lima');

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const profile = await profileService.createCustomer({
        tenantId: bookTenantId,
        firstName: custFirstName,
        lastName: custLastName,
        email: email,
        phone: custPhone,
        timezone: custTimezone
      });
      
      setCustomerProfile(profile);
      showAlert('Perfil de cliente creado.');
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Error creando perfil', 'error');
    }
  };

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <i className="fa-solid fa-address-card"></i> Perfil de Cliente
      </h2>
      {customerProfile ? (
        <div className="profile-details">
          <div className="detail-row">
            <strong>Nombre:</strong> {customerProfile.firstName} {customerProfile.lastName}
          </div>
          <div className="detail-row">
            <strong>Email:</strong> {customerProfile.email}
          </div>
          <div className="detail-row">
            <strong>Teléfono:</strong> {customerProfile.phone}
          </div>
          <div className="detail-row">
            <strong>Zona Horaria:</strong> {customerProfile.timezone}
          </div>
          <div className="detail-row">
            <strong>ID Cliente:</strong> <code className="code">{customerProfile.id}</code>
          </div>
          <div className="detail-row">
            <strong>ID Tenant:</strong> <code className="code">{customerProfile.tenantId}</code>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateCustomer} className="form">
          <p className="help-text">
            Para realizar reservas, debes registrar tu perfil de cliente en una de las empresas disponibles en el sistema.
          </p>
          
          <div className="form-group">
            <label className="label">Selecciona la Empresa para registrarte</label>
            <select 
              required 
              value={bookTenantId} 
              onChange={(e) => setBookTenantId(e.target.value)} 
              className="select"
            >
              <option value="">-- Seleccionar Empresa --</option>
              {tenants.map(t => {
                const tId = t.id.value || t.id;
                return (
                  <option key={tId} value={tId}>
                    {t.name}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Primer Nombre</label>
            <input 
              type="text" 
              required 
              value={custFirstName} 
              onChange={(e) => setCustFirstName(e.target.value)} 
              className="input" 
              placeholder="Ana"
            />
          </div>
          <div className="form-group">
            <label className="label">Apellidos</label>
            <input 
              type="text" 
              required 
              value={custLastName} 
              onChange={(e) => setCustLastName(e.target.value)} 
              className="input" 
              placeholder="Gómez"
            />
          </div>
          <div className="form-group">
            <label className="label">Teléfono</label>
            <input 
              type="text" 
              required 
              value={custPhone} 
              onChange={(e) => setCustPhone(e.target.value)} 
              className="input" 
              placeholder="999888777"
            />
          </div>
          
          <button type="submit" className="submit-btn">Crear Perfil Cliente</button>
        </form>
      )}
    </div>
  );
}

export default CustomerProfile;
