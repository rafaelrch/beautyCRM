import { SalonConfig } from '@/types';

export const mockSalonConfig: SalonConfig = {
  id: '1',
  name: 'Salão Beleza & Estilo',
  phone: '(71) 3333-4444',
  email: 'contato@salonbeleza.com.br',
  address: 'Rua das Flores, 123, Barra, Salvador - BA, CEP: 40140-000',
  cnpj: '12.345.678/0001-90',
  logo: undefined,
  businessHours: {
    monday: { open: '08:00', close: '18:00', closed: false },
    tuesday: { open: '08:00', close: '18:00', closed: false },
    wednesday: { open: '08:00', close: '18:00', closed: false },
    thursday: { open: '08:00', close: '18:00', closed: false },
    friday: { open: '08:00', close: '19:00', closed: false },
    saturday: { open: '08:00', close: '17:00', closed: false },
    sunday: { open: '09:00', close: '14:00', closed: false },
  },
};

