import api from '../../../shared/services/api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data; // Retorna { accessToken, tokenType }
  },

  register: async (email, password, fullName, registerRole) => {
    const path = registerRole === 'OWNER' ? '/auth/register-owner' : '/auth/register';
    const res = await api.post(path, { email, password, fullName });
    return res.data;
  }
};
