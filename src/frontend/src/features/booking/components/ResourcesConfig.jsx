import React, { useState } from 'react';
import useAppStore from '../../../store/useAppStore';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function ResourcesConfig() {
  const activeTenant = useAppStore((state) => state.activeTenant);
  const resources = useAppStore((state) => state.resources);
  const services = useAppStore((state) => state.services);
  const addResource = useAppStore((state) => state.addResource);
  const showAlert = useAppStore((state) => state.showAlert);

  const [resName, setResName] = useState('');
  const [resCapacity, setResCapacity] = useState(1);
  const [resServiceIds, setResServiceIds] = useState([]);

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!activeTenant) return;
    const tenantId = activeTenant.id.value || activeTenant.id;
    const newResource = {
      id: generateUUID(),
      tenantId,
      name: resName,
      capacity: Number(resCapacity),
      serviceIds: resServiceIds
    };
    addResource(newResource);
    showAlert(`Recurso "${resName}" asignado a ${resServiceIds.length} servicio(s).`);
    setResName('');
    setResServiceIds([]);
  };

  const activeTenantId = activeTenant ? (activeTenant.id.value || activeTenant.id) : null;
  const filteredResources = resources.filter(r => r.tenantId === activeTenantId);
  const filteredServices = services.filter(s => s.tenantId === activeTenantId);

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <i className="fa-solid fa-users-gear"></i> Recursos (Personal/Salas)
      </h2>
      <form onSubmit={handleAddResource} className="form-inline">
        <input 
          type="text" 
          required 
          placeholder="Nombre Recurso (Ej: Terapeuta 1)" 
          value={resName} 
          onChange={(e) => setResName(e.target.value)} 
          className="input-inline"
        />
        <select 
          required 
          multiple
          value={resServiceIds} 
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            setResServiceIds(selected);
          }} 
          className="select-inline"
          style={{ height: 'auto', minHeight: '80px' }}
        >
          {filteredServices.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button type="submit" className="inline-btn">Asignar</button>
      </form>

      <div className="list-container">
        {filteredResources.map((r) => {
          const srvs = services.filter(srv => (r.serviceIds || []).includes(srv.id));
          const srvsNames = srvs.length > 0 ? srvs.map(s => s.name).join(', ') : 'Ninguno';
          return (
            <div key={r.id} className="list-item">
              <div>
                <strong>{r.name}</strong>
                <div className="list-item-sub">Habilitado para: {srvsNames}</div>
              </div>
              <code className="list-code">{r.id.substring(0,8)}...</code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResourcesConfig;
