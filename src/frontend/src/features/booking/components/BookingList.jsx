import React from 'react';
import useAppStore from '../../../store/useAppStore';

function BookingList({ onSelectBooking, onRescheduleClick, onCancelClick }) {
  const bookings = useAppStore((state) => state.bookings);
  const selectedBooking = useAppStore((state) => state.selectedBooking);
  const services = useAppStore((state) => state.services);

  return (
    <div className="glass-card" style={{ gridColumn: 'span 2' }}>
      <h2 className="card-title">
        <i className="fa-solid fa-list-check"></i> Listado de Reservas
      </h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No hay reservas registradas.</td>
              </tr>
            ) : (
              bookings.map((b) => {
                const s = services.find(srv => srv.id === b.serviceId);
                const isSelected = selectedBooking && selectedBooking.id === b.id;
                return (
                  <tr 
                    key={b.id} 
                    onClick={() => onSelectBooking(b)}
                    className={`table-row ${isSelected ? 'selected' : ''}`}
                  >
                    <td>
                      <strong>{s ? s.name : `Servicio ${b.serviceId.substring(0,8)}`}</strong>
                    </td>
                    <td>{new Date(b.startsAt).toLocaleString()}</td>
                    <td>{new Date(b.endsAt).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${b.status}`}>{b.status}</span>
                    </td>
                    <td>{b.notes || '-'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {b.status !== 'CANCELLED' && (
                        <div className="action-group">
                          <button 
                            onClick={() => onRescheduleClick(b)} 
                            className="action-btn-resched"
                            title="Reprogramar"
                          >
                            <i className="fa-solid fa-clock-rotate-left"></i>
                          </button>
                          <button 
                            onClick={() => onCancelClick(b)} 
                            className="action-btn-cancel"
                            title="Cancelar"
                          >
                            <i className="fa-solid fa-calendar-xmark"></i>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookingList;
