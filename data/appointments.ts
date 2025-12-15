import { Appointment } from '@/types';
import { mockClients } from './clients';
import { mockServices } from './services';

const professionals = ['prof1', 'prof2', 'prof3', 'prof4', 'prof5', 'prof6', 'prof7', 'prof8'];

const generateAppointments = (): Appointment[] => {
  const appointments: Appointment[] = [];
  const today = new Date();
  
  // Generate appointments for the last 3 months
  for (let i = 0; i < 120; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    
    const client = mockClients[Math.floor(Math.random() * mockClients.length)];
    const serviceCount = Math.random() > 0.7 ? 2 : 1;
    const selectedServices = [];
    for (let j = 0; j < serviceCount; j++) {
      selectedServices.push(mockServices[Math.floor(Math.random() * mockServices.length)]);
    }
    
    const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    
    const hour = 8 + Math.floor(Math.random() * 10); // 8h to 18h
    const minute = Math.random() > 0.5 ? 0 : 30;
    const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const endHour = hour + Math.floor(totalDuration / 60);
    const endMinute = minute + (totalDuration % 60);
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    const statusRand = Math.random();
    const status = statusRand > 0.15 ? 'completed' :
                   statusRand > 0.05 ? 'cancelled' :
                   statusRand > 0.02 ? 'no-show' : 'scheduled';
    
    appointments.push({
      id: `apt-${i + 1}`,
      clientId: client.id,
      serviceIds: selectedServices.map(s => s.id),
      professionalId: professionals[Math.floor(Math.random() * professionals.length)],
      date,
      startTime,
      endTime,
      status: status as Appointment["status"],
      totalAmount,
      notes: Math.random() > 0.7 ? 'Cliente pontual' : '',
    });
  }

  // Generate today's appointments
  for (let i = 0; i < 15; i++) {
    const client = mockClients[Math.floor(Math.random() * mockClients.length)];
    const service = mockServices[Math.floor(Math.random() * mockServices.length)];
    const hour = 8 + Math.floor(Math.random() * 10);
    const minute = Math.random() > 0.5 ? 0 : 30;
    const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const endHour = hour + Math.floor(service.duration / 60);
    const endMinute = minute + (service.duration % 60);
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    appointments.push({
      id: `apt-today-${i + 1}`,
      clientId: client.id,
      serviceIds: [service.id],
      professionalId: professionals[Math.floor(Math.random() * professionals.length)],
      date: new Date(),
      startTime,
      endTime,
      status: 'scheduled' as Appointment["status"],
      totalAmount: service.price,
      notes: '',
    });
  }

  // Generate 3 appointments for "Em contato" column
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  for (let i = 0; i < 3; i++) {
    const client = mockClients[Math.floor(Math.random() * mockClients.length)];
    const service = mockServices[Math.floor(Math.random() * mockServices.length)];
    const hour = 9 + (i * 2); // 9h, 11h, 13h
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endHour = hour + Math.floor(service.duration / 60);
    const endMinute = service.duration % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    appointments.push({
      id: `apt-em-contato-${i + 1}`,
      clientId: client.id,
      serviceIds: [service.id],
      professionalId: professionals[Math.floor(Math.random() * professionals.length)],
      date: tomorrow,
      startTime,
      endTime,
      status: 'scheduled' as Appointment["status"],
      totalAmount: service.price,
      notes: 'kanbanColumnId:em-contato',
    });
  }

  return appointments.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const mockAppointments = generateAppointments();

