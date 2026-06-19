import React from 'react';
import useAppStore from '../../../store/useAppStore';

function NotificationMonitor() {
  const selectedBooking = useAppStore((state) => state.selectedBooking);
  const bookingNotifications = useAppStore((state) => state.bookingNotifications);
  const activeNotification = useAppStore((state) => state.activeNotification);
  const setActiveNotification = useAppStore((state) => state.setActiveNotification);

  return (
    <div className="glass-card" style={{ gridColumn: 'span 3' }}>
      <h2 className="card-title">
        <i className="fa-solid fa-envelope-open-text"></i> Monitor de Notificaciones 
        {selectedBooking ? ` - Reserva ${selectedBooking.id.substring(0,8)}` : ' (Selecciona una reserva arriba)'}
      </h2>
      
      {!selectedBooking ? (
        <p className="no-data">
          Haz clic sobre una reserva en la lista superior para visualizar la trazabilidad de sus correos electrónicos de confirmación, reprogramación y cancelación.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tópico / Asunto</th>
                <th>Destinatario</th>
                <th>Canal</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Reintentos</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {bookingNotifications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">No se han generado notificaciones para esta reserva.</td>
                </tr>
              ) : (
                bookingNotifications.map((n) => (
                  <tr key={n.id} className="table-row">
                    <td>
                      <strong>{n.subject || 'Sin Asunto'}</strong>
                      <div className="list-item-sub">Evento: {n.metadata.bookingId ? 'Reserva' : 'Recordatorio'}</div>
                    </td>
                    <td>{n.contactPoint}</td>
                    <td><span className="channel-badge">{n.channelCode}</span></td>
                    <td>
                      <span className={`status-badge notif-${n.status.toLowerCase()}`}>{n.status}</span>
                    </td>
                    <td>{new Date(n.createdAt).toLocaleString()}</td>
                    <td>{n.retryCount} / {n.maxRetries}</td>
                    <td>
                      <button 
                        onClick={() => setActiveNotification(n)} 
                        className="view-email-btn"
                      >
                        <i className="fa-solid fa-eye"></i> Ver Correo
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL PREVISUALIZADOR DE CORREO --- */}
      {activeNotification && (
        <div className="modal-overlay">
          <div className="modal email-preview">
            <div className="email-header">
              <div className="email-info">
                <div><strong>Para:</strong> {activeNotification.contactPoint}</div>
                <div><strong>Asunto:</strong> {activeNotification.subject}</div>
                <div>
                  <strong>Estado:</strong>{' '}
                  <span className={`status-badge notif-${activeNotification.status.toLowerCase()}`}>{activeNotification.status}</span>
                </div>
              </div>
              <button onClick={() => setActiveNotification(null)} className="close-email-btn">×</button>
            </div>
            
            <div className="email-body">
              <div 
                dangerouslySetInnerHTML={{ __html: activeNotification.renderedContent }} 
                className="email-content"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationMonitor;
