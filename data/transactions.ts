import { Transaction } from '@/types';
import { mockClients } from './clients';
import { mockServices } from './services';

// Generate transactions for the last 3 months
const generateTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  // Income transactions (70% of total)
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    
    const client = mockClients[Math.floor(Math.random() * mockClients.length)];
    const service = mockServices[Math.floor(Math.random() * mockServices.length)];
    const paymentMethods: ('cash' | 'credit' | 'debit' | 'pix')[] = ['cash', 'credit', 'debit', 'pix'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    transactions.push({
      id: `inc-${i + 1}`,
      date,
      type: 'income',
      category: service.category === 'hair' ? 'Serviços - Cabelo' : 
                service.category === 'nails' ? 'Serviços - Unhas' :
                service.category === 'aesthetics' ? 'Serviços - Estética' :
                service.category === 'makeup' ? 'Serviços - Maquiagem' : 'Serviços - Massagem',
      description: `${service.name} - ${client.name}`,
      amount: service.price,
      paymentMethod,
      clientId: client.id,
      serviceIds: [service.id],
      status: Math.random() > 0.1 ? 'completed' : 'pending',
    });
  }

  // Expense transactions (30% of total)
  const expenseCategories = [
    'Fornecedores', 'Salários', 'Aluguel', 'Energia', 'Água', 'Internet', 
    'Marketing', 'Manutenção', 'Produtos', 'Equipamentos'
  ];
  
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    
    const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
    const amount = category === 'Salários' ? 2500 + Math.random() * 2000 :
                   category === 'Aluguel' ? 3000 :
                   category === 'Fornecedores' ? 200 + Math.random() * 800 :
                   50 + Math.random() * 300;
    
    transactions.push({
      id: `exp-${i + 1}`,
      date,
      type: 'expense',
      category,
      description: category === 'Fornecedores' ? 'Compra de produtos' :
                   category === 'Salários' ? 'Pagamento de salários' :
                   category === 'Aluguel' ? 'Aluguel do salão' :
                   category,
      amount: Math.round(amount * 100) / 100,
      paymentMethod: category === 'Salários' ? 'pix' : 
                     Math.random() > 0.5 ? 'debit' : 'credit',
      status: Math.random() > 0.15 ? 'completed' : 'pending',
    });
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const mockTransactions = generateTransactions();

