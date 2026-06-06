import React, { useState, useEffect } from 'react';
import BookingForm from './BookingForm';
import BookingList from './BookingList';
import NotificationMonitor from './NotificationMonitor';
import { BookingModals } from './BookingModals';
import { bookingService } from '../services/bookingService';
import useAppStore from '../../../store/useAppStore';

function BookingsPage() {
  const token = useAppStore((state) => state.token);
  const role = useAppStore((state) => state.role);
  const activeTenant = useAppStore((state) => state.activeTenant);
  const customerProfile = useAppStore((state) => state.customerProfile);
  const setBookings = useAppStore((state) => state.setBookings);
  const selectedBooking = useAppStore((state) => state.selectedBooking);
  const setSelectedBooking = useAppStore((state) => state.setSelectedBooking);
  const setBookingNotifications = useAppStore((state) => state.setBookingNotifications);

  const [showReschedModal, setShowReschedModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const bookTenantId = customerProfile ? customerProfile.tenantId : null;
  const bookCustomerId = customerProfile ? customerProfile.id : null;

  const fetchBookings = async () => {
    try {
      const tId = role === 'OWNER' && activeTenant ? (activeTenant.id.value || activeTenant.id) : bookTenantId;
      if (!tId) return;
      const data = await bookingService.fetchBookings(tId, role === 'CLIENT' ? bookCustomerId : null);
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleSelectBooking = async (b) => {
    setSelectedBooking(b);
    try {
      const notifs = await bookingService.fetchNotifications(b.id);
      setBookingNotifications(notifs);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setBookingNotifications([]);
    }
  };

  const handleRescheduleClick = (b) => {
    setSelectedBooking(b);
    setShowReschedModal(true);
  };

  const handleCancelClick = (b) => {
    setSelectedBooking(b);
    setShowCancelModal(true);
  };

  // Cargar periódicamente las reservas
  useEffect(() => {
    if (token) {
      fetchBookings();
      const interval = setInterval(fetchBookings, 10000);
      return () => clearInterval(interval);
    }
  }, [token, activeTenant, bookCustomerId]);

  const handleSuccess = () => {
    fetchBookings();
    if (selectedBooking) {
      handleSelectBooking(selectedBooking);
    }
  };

  return (
    <div className="bookings-grid">
      {/* Formulario de reserva (Solo Clientes) */}
      {role === 'CLIENT' && customerProfile && (
        <BookingForm onBookingCreated={fetchBookings} />
      )}

      {/* Listado de Reservas */}
      <BookingList 
        onSelectBooking={handleSelectBooking}
        onRescheduleClick={handleRescheduleClick}
        onCancelClick={handleCancelClick}
      />

      {/* Monitor de Notificaciones de la Reserva Seleccionada */}
      <NotificationMonitor />

      {/* Modales */}
      <BookingModals 
        showReschedModal={showReschedModal}
        showCancelModal={showCancelModal}
        onCloseResched={() => setShowReschedModal(false)}
        onCloseCancel={() => setShowCancelModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default BookingsPage;
