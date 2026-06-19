import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import useAppStore from '../../../store/useAppStore';

export function BookingModals({
  showReschedModal,
  showCancelModal,
  onCloseResched,
  onCloseCancel,
  onSuccess
}) {
  const selectedBooking = useAppStore((state) => state.selectedBooking);
  const showAlert = useAppStore((state) => state.showAlert);

  // Estados de Reprogramación
  const [reschedStartsAt, setReschedStartsAt] = useState('');
  const [reschedReason, setReschedReason] = useState('');

  // Estados de Cancelación
  const [cancelReason, setCancelReason] = useState('CLIENT_REQUEST');
  const [cancelDesc, setCancelDesc] = useState('');

  useEffect(() => {
    if (selectedBooking && showReschedModal) {
      setReschedStartsAt(selectedBooking.startsAt.substring(0, 16));
      setReschedReason('');
    }
  }, [selectedBooking, showReschedModal]);

  useEffect(() => {
    if (showCancelModal) {
      setCancelReason('CLIENT_REQUEST');
      setCancelDesc('');
    }
  }, [showCancelModal]);

  const handleRescheduleBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      // Calcular endsAt de 45 mins por defecto
      const startsDate = new Date(reschedStartsAt);
      const endsDate = new Date(startsDate.getTime() + 45 * 60 * 1000);

      await bookingService.rescheduleBooking(selectedBooking.id, {
        newStartsAt: startsDate.toISOString(),
        newEndsAt: endsDate.toISOString(),
        reason: reschedReason
      });

      showAlert('Reserva reprogramada.');
      onCloseResched();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Error reprogramando reserva', 'error');
    }
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      await bookingService.cancelBooking(selectedBooking.id, {
        reasonCode: cancelReason,
        description: cancelDesc
      });

      showAlert('Reserva cancelada con éxito.');
      onCloseCancel();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || 'Error cancelando reserva', 'error');
    }
  };

  return (
    <>
      {/* --- MODAL DE REPROGRAMACIÓN --- */}
      {showReschedModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">
              <i className="fa-solid fa-clock-rotate-left"></i> Reprogramar Reserva
            </h3>
            <form onSubmit={handleRescheduleBooking} className="form">
              <div className="form-group">
                <label className="label">Nueva Fecha y Hora de Cita</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={reschedStartsAt} 
                  onChange={(e) => setReschedStartsAt(e.target.value)} 
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="label">Motivo del Cambio</label>
                <input 
                  type="text" 
                  required 
                  value={reschedReason} 
                  onChange={(e) => setReschedReason(e.target.value)} 
                  className="input"
                  placeholder="Por ejemplo, inconvenientes familiares"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={onCloseResched} className="cancel-btn">Cancelar</button>
                <button type="submit" className="confirm-btn">Actualizar Reserva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE CANCELACIÓN --- */}
      {showCancelModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">
              <i className="fa-solid fa-calendar-xmark"></i> Cancelar Reserva
            </h3>
            <form onSubmit={handleCancelBooking} className="form">
              <div className="form-group">
                <label className="label">Código de Razón</label>
                <select 
                  value={cancelReason} 
                  onChange={(e) => setCancelReason(e.target.value)} 
                  className="select"
                >
                  <option value="CLIENT_REQUEST">Solicitud del Cliente</option>
                  <option value="PROVIDER_UNAVAILABLE">Proveedor No Disponible</option>
                  <option value="NO_SHOW">Inasistencia</option>
                  <option value="OTHER">Otro motivo</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Detalle / Descripción</label>
                <textarea 
                  required 
                  value={cancelDesc} 
                  onChange={(e) => setCancelDesc(e.target.value)} 
                  className="textarea"
                  placeholder="Explica detalladamente el motivo de la cancelación..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={onCloseCancel} className="cancel-btn">Volver</button>
                <button type="submit" className="confirm-btn" style={{ backgroundColor: '#ef4444' }}>
                  Confirmar Cancelación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
