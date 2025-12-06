// Helper function to convert date strings to Date objects
const parseDates = <T>(items: any[]): T[] => {
  return items.map(item => {
    if (!item) return item;
    const parsed = { ...item };
    // Convert common date fields - only if they exist and are strings
    if (parsed.birthdate && typeof parsed.birthdate === 'string' && parsed.birthdate !== 'null') {
      const date = new Date(parsed.birthdate);
      if (!isNaN(date.getTime())) {
        parsed.birthdate = date;
      }
    }
    if (parsed.registrationDate && typeof parsed.registrationDate === 'string' && parsed.registrationDate !== 'null') {
      const date = new Date(parsed.registrationDate);
      if (!isNaN(date.getTime())) {
        parsed.registrationDate = date;
      }
    }
    if (parsed.lastVisit && typeof parsed.lastVisit === 'string' && parsed.lastVisit !== 'null') {
      const date = new Date(parsed.lastVisit);
      if (!isNaN(date.getTime())) {
        parsed.lastVisit = date;
      }
    }
    if (parsed.date && typeof parsed.date === 'string' && parsed.date !== 'null') {
      const date = new Date(parsed.date);
      if (!isNaN(date.getTime())) {
        parsed.date = date;
      }
    }
    if (parsed.lastPurchase && typeof parsed.lastPurchase === 'string' && parsed.lastPurchase !== 'null') {
      const date = new Date(parsed.lastPurchase);
      if (!isNaN(date.getTime())) {
        parsed.lastPurchase = date;
      }
    }
    if (parsed.expirationDate && typeof parsed.expirationDate === 'string' && parsed.expirationDate !== 'null') {
      const date = new Date(parsed.expirationDate);
      if (!isNaN(date.getTime())) {
        parsed.expirationDate = date;
      }
    }
    // For appointments, ensure the 'date' field is a Date object
    if (parsed.data && typeof parsed.data === 'string' && parsed.data !== 'null') {
      const date = new Date(parsed.data);
      if (!isNaN(date.getTime())) {
        parsed.data = date;
      }
    }
    return parsed;
  });
};

// Generic CRUD functions for localStorage
export const storage = {
  get: <T>(key: string): T[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return parseDates<T>(parsed);
    } catch {
      return [];
    }
  },

  set: <T>(key: string, data: T[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  },

  add: <T extends { id: string }>(key: string, item: T): T => {
    const items = storage.get<T>(key);
    const newItem = { ...item, id: item.id || crypto.randomUUID() };
    storage.set(key, [...items, newItem]);
    return newItem;
  },

  update: <T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null => {
    const items = storage.get<T>(key);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    const updatedItem = { ...items[index], ...updates };
    items[index] = updatedItem;
    storage.set(key, items);
    return updatedItem;
  },

  delete: <T extends { id: string }>(key: string, id: string): boolean => {
    const items = storage.get<T>(key);
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    storage.set(key, filtered);
    return true;
  },
};

// Initialize with mock data on first load
export const initializeStorage = (mockData: {
  clients: any[];
  services: any[];
  transactions: any[];
  products: any[];
  appointments: any[];
  movements: any[];
  salonConfig: any;
}): void => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('initialized')) {
    storage.set('clients', mockData.clients);
    storage.set('services', mockData.services);
    storage.set('transactions', mockData.transactions);
    storage.set('products', mockData.products);
    storage.set('appointments', mockData.appointments);
    storage.set('movements', mockData.movements);
    storage.set('salonConfig', [mockData.salonConfig]);
    localStorage.setItem('initialized', 'true');
  }
};
