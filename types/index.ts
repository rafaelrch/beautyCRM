// Client interface
export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthdate: Date;
  address: string;
  cpf: string;
  registrationDate: Date;
  lastVisit: Date | null;
  totalSpent: number;
  totalVisits: number;
  notes: string;
  status: 'active' | 'inactive';
}

// Service interface
export interface Service {
  id: string;
  name: string;
  category: 'hair' | 'nails' | 'aesthetics' | 'makeup' | 'massage';
  duration: number; // minutes
  price: number;
  description: string;
  professionalIds: string[];
  active: boolean;
}

// Transaction interface
export interface Transaction {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'pix';
  clientId?: string;
  serviceIds?: string[];
  status: 'completed' | 'pending' | 'cancelled';
}

// Product interface
export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  costPrice: number;
  salePrice: number;
  supplier: string;
  lastPurchase: Date;
  expirationDate?: Date;
}

// Appointment interface
export interface Appointment {
  id: string;
  clientId: string;
  serviceIds: string[];
  professionalId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status:
    | 'agendado'
    | 'confirmado'
    | 'concluido'
    | 'cancelado'
    | 'nao_compareceu'
    | 'scheduled'
    | 'completed'
    | 'cancelled'
    | 'no-show';
  totalAmount: number;
  notes: string;
}

// Stock Movement interface
export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  date: Date;
  reason: string;
  userId: string;
}

// Salon Config interface
export interface SalonConfig {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  cnpj: string;
  logo?: string;
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
}

// Professional interface
export interface Professional {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialties: string[];
  active: boolean;
}

