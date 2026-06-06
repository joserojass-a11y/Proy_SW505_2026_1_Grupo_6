import api from '../../../shared/services/api';

export const bookingService = {
  fetchBookings: async (tenantId, customerId) => {
    let url = `/bookings?tenantId=${tenantId}`;
    if (customerId) {
      url += `&customerId=${customerId}`;
    }
    const res = await api.get(url);
    return res.data;
  },

  createBooking: async ({
    tenantId,
    branchId = '823e4567-e89b-12d3-a456-426614174099',
    customerId,
    serviceId,
    resourceId,
    startsAt,
    endsAt,
    customerTimezone = 'America/Lima',
    sourceChannel = 'WEB',
    notes
  }) => {
    const res = await api.post('/bookings', {
      tenantId,
      branchId,
      customerId,
      serviceId,
      resourceId: resourceId || '723e4567-e89b-12d3-a456-426614174099',
      startsAt,
      endsAt,
      customerTimezone,
      sourceChannel,
      notes
    });
    return res.data;
  },

  rescheduleBooking: async (bookingId, { newStartsAt, newEndsAt, reason }) => {
    const res = await api.post(`/bookings/${bookingId}/reschedule`, {
      newStartsAt,
      newEndsAt,
      reason
    });
    return res.data;
  },

  cancelBooking: async (bookingId, { reasonCode, description }) => {
    const res = await api.post(`/bookings/${bookingId}/cancel`, {
      reasonCode,
      description
    });
    return res.data;
  },

  fetchNotifications: async (bookingId) => {
    const res = await api.get(`/notifications?bookingId=${bookingId}`);
    return res.data;
  }
};
