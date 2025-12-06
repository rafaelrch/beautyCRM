import { Service } from '@/types';

export const mockServices: Service[] = [
  // Hair services
  { id: '1', name: 'Corte Feminino', category: 'hair', duration: 60, price: 80.00, description: 'Corte de cabelo feminino com lavagem', professionalIds: ['prof1', 'prof2'], active: true },
  { id: '2', name: 'Corte Masculino', category: 'hair', duration: 30, price: 35.00, description: 'Corte de cabelo masculino', professionalIds: ['prof1'], active: true },
  { id: '3', name: 'Coloração Completa', category: 'hair', duration: 180, price: 250.00, description: 'Coloração completa com produtos premium', professionalIds: ['prof2', 'prof3'], active: true },
  { id: '4', name: 'Mechas', category: 'hair', duration: 240, price: 350.00, description: 'Aplicação de mechas', professionalIds: ['prof2', 'prof3'], active: true },
  { id: '5', name: 'Escova Progressiva', category: 'hair', duration: 300, price: 400.00, description: 'Escova progressiva com alisamento', professionalIds: ['prof3'], active: true },
  { id: '6', name: 'Hidratação Capilar', category: 'hair', duration: 90, price: 120.00, description: 'Hidratação profunda', professionalIds: ['prof1', 'prof2'], active: true },
  { id: '7', name: 'Botox Capilar', category: 'hair', duration: 120, price: 180.00, description: 'Tratamento botox capilar', professionalIds: ['prof2', 'prof3'], active: true },
  { id: '8', name: 'Penteado', category: 'hair', duration: 90, price: 100.00, description: 'Penteado para eventos', professionalIds: ['prof1', 'prof2'], active: true },
  
  // Nails services
  { id: '9', name: 'Manicure Simples', category: 'nails', duration: 45, price: 30.00, description: 'Manicure básica', professionalIds: ['prof4'], active: true },
  { id: '10', name: 'Pedicure Simples', category: 'nails', duration: 60, price: 40.00, description: 'Pedicure básica', professionalIds: ['prof4', 'prof5'], active: true },
  { id: '11', name: 'Manicure e Pedicure', category: 'nails', duration: 90, price: 65.00, description: 'Pacote completo', professionalIds: ['prof4', 'prof5'], active: true },
  { id: '12', name: 'Unha em Gel', category: 'nails', duration: 120, price: 120.00, description: 'Aplicação de unha em gel', professionalIds: ['prof4'], active: true },
  { id: '13', name: 'Unha em Acrílico', category: 'nails', duration: 120, price: 130.00, description: 'Aplicação de unha em acrílico', professionalIds: ['prof4'], active: true },
  { id: '14', name: 'Manutenção Unha Gel', category: 'nails', duration: 90, price: 80.00, description: 'Manutenção de unha em gel', professionalIds: ['prof4'], active: true },
  { id: '15', name: 'Decoração de Unhas', category: 'nails', duration: 30, price: 25.00, description: 'Decoração artística', professionalIds: ['prof4', 'prof5'], active: true },
  
  // Aesthetics services
  { id: '16', name: 'Limpeza de Pele', category: 'aesthetics', duration: 90, price: 150.00, description: 'Limpeza facial profunda', professionalIds: ['prof6'], active: true },
  { id: '17', name: 'Peeling Químico', category: 'aesthetics', duration: 60, price: 200.00, description: 'Peeling químico facial', professionalIds: ['prof6'], active: true },
  { id: '18', name: 'Drenagem Linfática', category: 'aesthetics', duration: 60, price: 120.00, description: 'Drenagem linfática corporal', professionalIds: ['prof6', 'prof7'], active: true },
  { id: '19', name: 'Depilação a Laser', category: 'aesthetics', duration: 45, price: 180.00, description: 'Sessão de depilação a laser', professionalIds: ['prof6'], active: true },
  { id: '20', name: 'Tratamento para Acne', category: 'aesthetics', duration: 90, price: 220.00, description: 'Tratamento específico para acne', professionalIds: ['prof6'], active: true },
  
  // Makeup services
  { id: '21', name: 'Maquiagem Social', category: 'makeup', duration: 60, price: 100.00, description: 'Maquiagem para dia a dia', professionalIds: ['prof8'], active: true },
  { id: '22', name: 'Maquiagem para Eventos', category: 'makeup', duration: 90, price: 180.00, description: 'Maquiagem para festas e eventos', professionalIds: ['prof8'], active: true },
  { id: '23', name: 'Maquiagem para Casamento', category: 'makeup', duration: 120, price: 300.00, description: 'Maquiagem completa para casamento', professionalIds: ['prof8'], active: true },
  { id: '24', name: 'Aula de Automaquiagem', category: 'makeup', duration: 120, price: 250.00, description: 'Aula personalizada de maquiagem', professionalIds: ['prof8'], active: true },
  
  // Massage services
  { id: '25', name: 'Massagem Relaxante', category: 'massage', duration: 60, price: 120.00, description: 'Massagem relaxante corporal', professionalIds: ['prof7'], active: true },
  { id: '26', name: 'Massagem Terapêutica', category: 'massage', duration: 60, price: 150.00, description: 'Massagem para alívio de dores', professionalIds: ['prof7'], active: true },
  { id: '27', name: 'Massagem com Pedras Quentes', category: 'massage', duration: 90, price: 200.00, description: 'Massagem com pedras quentes', professionalIds: ['prof7'], active: true },
  { id: '28', name: 'Massagem Facial', category: 'massage', duration: 45, price: 100.00, description: 'Massagem facial relaxante', professionalIds: ['prof6', 'prof7'], active: true },
];
