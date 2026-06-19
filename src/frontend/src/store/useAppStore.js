import { create } from 'zustand';

let alertTimeout = null;

const useAppStore = create((set) => ({
  // --- Estados de Autenticación y Sesión ---
  token: localStorage.getItem('token') || '',
  role: localStorage.getItem('role') || '',
  userId: localStorage.getItem('userId') || '',
  email: localStorage.getItem('email') || '',
  customerProfile: JSON.parse(localStorage.getItem('customerProfile') || 'null'),

  // --- Estados de Negocio (Persistidos en LocalStorage) ---
  zones: JSON.parse(localStorage.getItem('zones') || '[]'),
  tenants: JSON.parse(localStorage.getItem('tenants') || '[]'),
  activeTenant: JSON.parse(localStorage.getItem('activeTenant') || 'null'),
  services: JSON.parse(localStorage.getItem('services') || '[]'),
  resources: JSON.parse(localStorage.getItem('resources') || '[]'),
  schedules: JSON.parse(localStorage.getItem('schedules') || '[]'),

  // --- Listas y Modales ---
  bookings: [],
  selectedBooking: null,
  bookingNotifications: [],
  activeNotification: null,
  alert: null,

  // --- Acciones de Sesión ---
  setSession: (token, role, userId, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email);
    set({ token, role, userId, email });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('customerProfile');
    localStorage.removeItem('activeTenant');
    set({
      token: '',
      role: '',
      userId: '',
      email: '',
      customerProfile: null,
      activeTenant: null,
      bookings: [],
      selectedBooking: null,
      bookingNotifications: [],
      activeNotification: null,
    });
  },

  setCustomerProfile: (profile) => {
    if (profile) {
      localStorage.setItem('customerProfile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('customerProfile');
    }
    set({ customerProfile: profile });
  },

  // --- Acciones de Negocio ---
  setZones: (zones) => {
    localStorage.setItem('zones', JSON.stringify(zones));
    set({ zones });
  },

  setTenants: (tenants) => {
    localStorage.setItem('tenants', JSON.stringify(tenants));
    set({ tenants });
  },

  addTenant: (tenant) => {
    set((state) => {
      const updatedTenants = [...state.tenants, tenant];
      localStorage.setItem('tenants', JSON.stringify(updatedTenants));
      return { tenants: updatedTenants, activeTenant: tenant };
    });
  },

  setActiveTenant: (activeTenant) => {
    if (activeTenant) {
      localStorage.setItem('activeTenant', JSON.stringify(activeTenant));
    } else {
      localStorage.removeItem('activeTenant');
    }
    set({ activeTenant });
  },

  setServices: (services) => {
    localStorage.setItem('services', JSON.stringify(services));
    set({ services });
  },

  addService: (service) => {
    set((state) => {
      const updatedServices = [...state.services, service];
      localStorage.setItem('services', JSON.stringify(updatedServices));
      return { services: updatedServices };
    });
  },

  setResources: (resources) => {
    localStorage.setItem('resources', JSON.stringify(resources));
    set({ resources });
  },

  addResource: (resource) => {
    set((state) => {
      const updatedResources = [...state.resources, resource];
      localStorage.setItem('resources', JSON.stringify(updatedResources));
      return { resources: updatedResources };
    });
  },

  setSchedules: (schedules) => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
    set({ schedules });
  },

  addSchedule: (schedule) => {
    set((state) => {
      const updatedSchedules = [...state.schedules, schedule];
      localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
      return { schedules: updatedSchedules };
    });
  },

  // --- Acciones de Reservas ---
  setBookings: (bookings) => set({ bookings }),
  setSelectedBooking: (selectedBooking) => set({ selectedBooking }),
  setBookingNotifications: (bookingNotifications) => set({ bookingNotifications }),
  setActiveNotification: (activeNotification) => set({ activeNotification }),

  // --- Acciones de UI (Alertas) ---
  showAlert: (message, type = 'success') => {
    set({ alert: { message, type } });
    if (alertTimeout) clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => {
      set({ alert: null });
    }, 5000);
  },
  
  clearAlert: () => {
    if (alertTimeout) clearTimeout(alertTimeout);
    set({ alert: null });
  }
}));

export default useAppStore;
