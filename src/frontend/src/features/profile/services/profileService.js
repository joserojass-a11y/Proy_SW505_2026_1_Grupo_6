import api from '../../../shared/services/api';

export const profileService = {
  createTenant: async ({ countryCode, subdomain, name }) => {
    const res = await api.post('/tenants', {
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

  createCustomer: async ({ tenantId, firstName, lastName, email, phone, timezone }) => {
    const res = await api.post('/customers', {
      tenantId,
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
