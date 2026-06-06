import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import useAppStore from '../../../store/useAppStore';

function BookingForm({ onBookingCreated }) {
  const customerProfile = useAppStore((state) => state.customerProfile);
  const services = useAppStore((state) => state.services);
  const resources = useAppStore((state) => state.resources);
  const showAlert = useAppStore((state) => state.showAlert);

  const [bookServiceId, setBookServiceId] = useState('');
  const [bookResourceId, setBookResourceId] = useState('');
  const [bookStartsAt, setBookStartsAt] = useState('');
  const [bookNotes, setBookNotes] = useState('');

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!customerProfile) return;
    try {
      // Calcular endsAt sumando la duración del servicio
      const service = services.find(s => s.id === bookServiceId);
      const duration = service ? service.baseDurationMinutes : 30;
      const startsDate = new Date(bookStartsAt);
      const endsDate = new Date(startsDate.getTime() + duration * 60 * 1000);

      await bookingService.createBooking({
        tenantId: customerProfile.tenantId,
        customerId: customerProfile.id,
        serviceId: bookServiceId,
        resourceId: bookResourceId,
        startsAt: startsDate.toISOString(),
        endsAt: endsDate.toISOString(),
        notes: bookNotes
      });

      showAlert('Reserva creada exitosamente y confirmada.');
      setBookNotes('');
      setBookServiceId('');
      setBookResourceId('');
      setBookStartsAt('');
      
      if (onBookingCreated) {
        onBookingCreated();
      }
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Error al crear la reserva', 'error');
    }
  };

  const bookTenantId = customerProfile ? customerProfile.tenantId : null;
  const filteredServices = services.filter(s => s.tenantId === bookTenantId);
  const filteredResources = resources.filter(r => r.tenantId === bookTenantId && (!bookServiceId || r.serviceId === bookServiceId));

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <i className="fa-solid fa-plus"></i> Nueva Cita
      </h2>
      <form onSubmit={handleCreateBooking} className="form">
        <div className="form-group">
          <label className="label">Servicio</label>
          <select 
            required 
            value={bookServiceId} 
            onChange={(e) => {
              setBookServiceId(e.target.value);
              setBookResourceId(''); // Limpiar recurso
            }} 
            className="select"
          >
            <option value="">-- Seleccionar Servicio --</option>
            {filteredServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.baseDurationMinutes} min | S/. {s.basePrice})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Personal / Especialista</label>
          <select 
            value={bookResourceId} 
            onChange={(e) => setBookResourceId(e.target.value)} 
            className="select"
          >
            <option value="">-- Cualquiera disponible --</option>
            {filteredResources.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Fecha y Hora de Inicio</label>
          <input 
            type="datetime-local" 
            required 
            value={bookStartsAt} 
            onChange={(e) => setBookStartsAt(e.target.value)} 
            className="input"
          />
        </div>

        <div className="form-group">
          <label className="label">Notas para la Reserva</label>
          <textarea 
            value={bookNotes} 
            onChange={(e) => setBookNotes(e.target.value)} 
            className="textarea" 
            placeholder="Indica alergias o pedidos especiales..."
          />
        </div>

        <button type="submit" className="submit-btn">Reservar Ahora</button>
      </form>
    </div>
  );
}

export default BookingForm;
