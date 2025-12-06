import { StockMovement } from '@/types';
import { mockProducts } from './products';

const generateMovements = (): StockMovement[] => {
  const movements: StockMovement[] = [];
  const today = new Date();
  
  // Generate movements for the last 3 months
  for (let i = 0; i < 80; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    
    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const type = Math.random() > 0.3 ? 'in' : 'out';
    const quantity = type === 'in' ? 
      Math.floor(Math.random() * 50) + 10 : 
      Math.floor(Math.random() * 20) + 1;
    
    const reasons = type === 'in' ? 
      ['Compra', 'Devolução', 'Ajuste de estoque'] :
      ['Venda', 'Uso interno', 'Perda', 'Vencimento'];
    
    movements.push({
      id: `mov-${i + 1}`,
      productId: product.id,
      type: type as 'in' | 'out',
      quantity,
      date,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      userId: 'user1',
    });
  }

  return movements.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const mockMovements = generateMovements();

