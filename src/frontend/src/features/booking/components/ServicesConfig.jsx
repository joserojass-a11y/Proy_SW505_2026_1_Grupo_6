import React, { useState } from 'react';
import useAppStore from '../../../store/useAppStore';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function ServicesConfig() {
  const activeTenant = useAppStore((state) => state.activeTenant);
  const services = useAppStore((state) => state.services);
  const addService = useAppStore((state) => state.addService);
  const showAlert = useAppStore((state) => state.showAlert);

  const [srvName, setSrvName] = useState('');
  const [srvDuration, setSrvDuration] = useState(30);
  const [srvPrice, setSrvPrice] = useState(50);

  const handleAddService = (e) => {
    e.preventDefault();
    if (!activeTenant) return;
    const tenantId = activeTenant.id.value || activeTenant.id;
    const newService = {
      id: generateUUID(),
      tenantId,
      categoryId: generateUUID(),
      name: srvName,
      baseDurationMinutes: Number(srvDuration),
      basePrice: Number(srvPrice),
      isActive: true
    };
    addService(newService);
    showAlert(`Servicio "${srvName}" configurado.`);
    setSrvName('');
    setSrvPrice(50);
  };

  const activeTenantId = activeTenant ? (activeTenant.id.value || activeTenant.id) : null;
  const filteredServices = services.filter(s => s.tenantId === activeTenantId);

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <i className="fa-solid fa-scissors"></i> Configurar Servicios
      </h2>
      <form onSubmit={handleAddService} className="form-inline">
        <input 
          type="text" 
          required 
          placeholder="Nombre de Servicio (Ej: Masaje)" 
          value={srvName} 
          onChange={(e) => setSrvName(e.target.value)} 
          className="input-inline"
        />
        <input 
          type="number" 
          required 
          placeholder="Duración (minutos)" 
          value={srvDuration} 
          onChange={(e) => setSrvDuration(e.target.value)} 
          className="input-inline"
          style={{ width: '120px' }}
        />
        <input 
          type="number" 
          required 
          placeholder="Precio" 
          value={srvPrice} 
          onChange={(e) => setSrvPrice(e.target.value)} 
          className="input-inline"
          style={{ width: '100px' }}
        />
        <button type="submit" className="inline-btn">Agregar</button>
      </form>

      <div className="list-container">
        {filteredServices.map((s) => (
          <div key={s.id} className="list-item">
            <div>
              <strong>{s.name}</strong>
              <div className="list-item-sub">{s.baseDurationMinutes} min | S/. {s.basePrice}</div>
            </div>
            <code className="list-code">{s.id.substring(0,8)}...</code>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServicesConfig;
