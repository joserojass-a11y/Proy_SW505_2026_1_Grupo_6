import api from '../../../shared/services/api';

export const profileService = {
  createTenant: async ({ zoneId, countryCode, subdomain, name }) => {
    const res = await api.post('/tenants', {
      zoneId,
      countryCode,
      subdomain,
      name,
      globalSettings: {
        reminderLeadTimeHours: 24,
        reminderSecondaryLeadTimeHours: 1
      }
    });
    return res.data;
  },

  fetchCustomerProfile: async () => {
    const res = await api.get('/customers/me');
    return res.data;
  },

  createCustomer: async ({ tenantId, zoneId, firstName, lastName, email, phone, timezone }) => {
    const res = await api.post('/customers', {
      tenantId,
      zoneId,
      firstName,
      lastName,
      email,
      phone,
      timezone,
      preferences: {},
      consentSigned: true
    });
    return res.data;
  }
};
