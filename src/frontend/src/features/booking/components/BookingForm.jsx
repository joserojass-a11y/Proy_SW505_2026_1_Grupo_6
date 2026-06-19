import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import useAppStore from '../../../store/useAppStore';
import api from '../../../shared/services/api';

function BookingForm({ onBookingCreated }) {
  const customerProfile = useAppStore((state) => state.customerProfile);
  const services = useAppStore((state) => state.services);
  const resources = useAppStore((state) => state.resources);
  const showAlert = useAppStore((state) => state.showAlert);

  const [bookServiceId, setBookServiceId] = useState('');
  const [bookResourceId, setBookResourceId] = useState('');
  const [bookNotes, setBookNotes] = useState('');
  
  // Calendario
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!customerProfile) return;
    if (!selectedSlot) {
      showAlert('Por favor selecciona un horario disponible.', 'error');
      return;
    }
    
    try {
      await bookingService.createBooking({
        tenantId: customerProfile.tenantId,
        customerId: customerProfile.id,
        serviceId: bookServiceId,
        resourceId: selectedSlot.resourceId, // Extraído del slot
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
        notes: bookNotes
      });

      showAlert('Reserva creada exitosamente y confirmada.');
      setBookNotes('');
      setBookServiceId('');
      setBookResourceId('');
      setSelectedSlot(null);
      setSlots([]);
      
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
  const filteredResources = resources.filter(r => r.tenantId === bookTenantId && (!bookServiceId || (r.serviceIds || []).includes(bookServiceId)));

  useEffect(() => {
    const fetchSlots = async () => {
      if (!bookServiceId) {
        setSlots([]);
        return;
      }
      setIsLoadingSlots(true);
      try {
        const res = await api.get('/slots', {
          params: {
            serviceId: bookServiceId,
            resourceId: bookResourceId || undefined
          }
        });
        setSlots(res.data);
      } catch (err) {
        console.error('Error fetching slots from API, using mock logic fallback', err);
        // Fallback for demo purposes if backend isn't ready
        const dummySlots = [];
        const resId = bookResourceId || (filteredResources[0]?.id) || 'demo-resource-id';
        const now = new Date();
        now.setMinutes(0, 0, 0);
        for(let i=1; i<=10; i++) {
          const start = new Date(now.getTime() + i * 3600 * 1000);
          const end = new Date(start.getTime() + 30 * 60 * 1000);
          dummySlots.push({
            id: `slot-${i}`,
            resourceId: resId,
            startsAt: start.toISOString(),
            endsAt: end.toISOString(),
            status: 'AVAILABLE'
          });
        }
        setSlots(dummySlots);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    
    fetchSlots();
  }, [bookServiceId, bookResourceId]);

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
              setSelectedSlot(null);
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
          <label className="label">Seleccionar Horario</label>
          {!bookServiceId ? (
            <div className="help-text">Selecciona un servicio para ver disponibilidad.</div>
          ) : isLoadingSlots ? (
            <div className="help-text">Cargando horarios...</div>
          ) : slots.length === 0 ? (
            <div className="help-text">No hay horarios disponibles.</div>
          ) : (
            <div className="slots-grid">
              {slots.map((slot, idx) => {
                const dateObj = new Date(slot.startsAt);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString();
                const isSelected = selectedSlot && selectedSlot.startsAt === slot.startsAt && selectedSlot.resourceId === slot.resourceId;
                
                return (
                  <div 
                    key={slot.id || idx}
                    className={`slot-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="slot-time">{timeStr}</div>
                    <div className="slot-date">{dateStr}</div>
                  </div>
                );
              })}
            </div>
          )}
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
