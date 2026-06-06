import React, { useState } from 'react';
import useAppStore from '../../../store/useAppStore';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function ScheduleConfig() {
  const activeTenant = useAppStore((state) => state.activeTenant);
  const schedules = useAppStore((state) => state.schedules);
  const addSchedule = useAppStore((state) => state.addSchedule);
  const showAlert = useAppStore((state) => state.showAlert);

  const [schDay, setSchDay] = useState('Lunes');
  const [schStart, setSchStart] = useState('09:00');
  const [schEnd, setSchEnd] = useState('18:00');

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!activeTenant) return;
    const tenantId = activeTenant.id.value || activeTenant.id;
    const newSchedule = {
      id: generateUUID(),
      tenantId,
      dayOfWeek: schDay,
      startTime: schStart,
      endTime: schEnd
    };
    addSchedule(newSchedule);
    showAlert(`Regla de horario para el ${schDay} agregada.`);
  };

  const activeTenantId = activeTenant ? (activeTenant.id.value || activeTenant.id) : null;
  const filteredSchedules = schedules.filter(sch => sch.tenantId === activeTenantId);

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <i className="fa-solid fa-clock"></i> Reglas de Disponibilidad
      </h2>
      <form onSubmit={handleAddSchedule} className="form-inline">
        <select 
          value={schDay} 
          onChange={(e) => setSchDay(e.target.value)} 
          className="select-inline"
        >
          <option value="Lunes">Lunes</option>
          <option value="Martes">Martes</option>
          <option value="Miércoles">Miércoles</option>
          <option value="Jueves">Jueves</option>
          <option value="Viernes">Viernes</option>
          <option value="Sábado">Sábado</option>
          <option value="Domingo">Domingo</option>
        </select>
        <input 
          type="text" 
          required 
          placeholder="Inicio (09:00)" 
          value={schStart} 
          onChange={(e) => setSchStart(e.target.value)} 
          className="input-inline"
          style={{ width: '100px' }}
        />
        <input 
          type="text" 
          required 
          placeholder="Fin (18:00)" 
          value={schEnd} 
          onChange={(e) => setSchEnd(e.target.value)} 
          className="input-inline"
          style={{ width: '100px' }}
        />
        <button type="submit" className="inline-btn">Guardar</button>
      </form>

      <div className="list-container">
        {filteredSchedules.map((sch) => (
          <div key={sch.id} className="list-item">
            <div>
              <strong>{sch.dayOfWeek}</strong>
              <div className="list-item-sub">Horario: {sch.startTime} - {sch.endTime}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScheduleConfig;
