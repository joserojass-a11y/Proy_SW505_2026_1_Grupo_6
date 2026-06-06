import React, { useState } from 'react';
import { profileService } from '../services/profileService';
import useAppStore from '../../../store/useAppStore';

function TenantManager() {
  const tenants = useAppStore((state) => state.tenants);
  const activeTenant = useAppStore((state) => state.activeTenant);
  const addTenant = useAppStore((state) => state.addTenant);
  const setActiveTenant = useAppStore((state) => state.setActiveTenant);
  const showAlert = useAppStore((state) => state.showAlert);

  const [tenantName, setTenantName] = useState('');
  const [tenantSubdomain, setTenantSubdomain] = useState('');
  const [tenantCountry, setTenantCountry] = useState('PE');

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      const newTenant = await profileService.createTenant({
        countryCode: tenantCountry,
        subdomain: tenantSubdomain,
        name: tenantName,
      });
      
      addTenant(newTenant);
      showAlert(`Empresa "${newTenant.name}" registrada con éxito.`);
      setTenantName('');
      setTenantSubdomain('');
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Error creando la empresa', 'error');
    }
  };

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <i className="fa-solid fa-building"></i> Registrar Empresa / Tenant
      </h2>
      <form onSubmit={handleCreateTenant} className="form">
        <div className="form-group">
          <label className="label">Nombre de la Empresa</label>
          <input 
            type="text" 
            required 
            value={tenantName} 
            onChange={(e) => setTenantName(e.target.value)} 
            className="input" 
            placeholder="Mi Peluquería S.A.C."
          />
        </div>
        <div className="form-group">
          <label className="label">Subdominio de Acceso</label>
          <input 
            type="text" 
            required 
            value={tenantSubdomain} 
            onChange={(e) => setTenantSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
            className="input" 
            placeholder="mi-peluqueria"
          />
        </div>
        <div className="form-group">
          <label className="label">País</label>
          <input 
            type="text" 
            required 
            value={tenantCountry} 
            onChange={(e) => setTenantCountry(e.target.value.substring(0,2).toUpperCase())} 
            className="input" 
            placeholder="PE"
          />
        </div>
        
        <button type="submit" className="submit-btn">Registrar Empresa</button>
      </form>

      {tenants.length > 0 && (
        <div className="tenant-selector-container">
          <h4 className="sub-title">Selecciona Empresa Activa:</h4>
          <div className="tenant-list">
            {tenants.map((t) => {
              const tId = t.id.value || t.id;
              const activeId = activeTenant ? (activeTenant.id.value || activeTenant.id) : null;
              const isActive = activeId === tId;
              return (
                <div 
                  key={tId} 
                  onClick={() => {
                    setActiveTenant(t);
                    showAlert(`Empresa activa seleccionada: ${t.name}`);
                  }}
                  className={`tenant-card ${isActive ? 'active' : ''}`}
                >
                  <strong>{t.name}</strong>
                  <span className="tenant-sub">{t.subdomain}.localhost</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TenantManager;
