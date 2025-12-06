import { Product } from '@/types';

export const mockProducts: Product[] = [
  { id: '1', name: 'Shampoo Profissional', category: 'Cabelo', quantity: 45, minQuantity: 20, unit: 'un', costPrice: 25.00, salePrice: 45.00, supplier: 'Distribuidora Beleza', lastPurchase: new Date('2024-11-01'), expirationDate: new Date('2026-11-01') },
  { id: '2', name: 'Condicionador Profissional', category: 'Cabelo', quantity: 38, minQuantity: 20, unit: 'un', costPrice: 28.00, salePrice: 50.00, supplier: 'Distribuidora Beleza', lastPurchase: new Date('2024-11-01'), expirationDate: new Date('2026-11-01') },
  { id: '3', name: 'Tinta para Cabelo', category: 'Cabelo', quantity: 12, minQuantity: 15, unit: 'un', costPrice: 15.00, salePrice: 35.00, supplier: 'Cosméticos Premium', lastPurchase: new Date('2024-10-15'), expirationDate: new Date('2025-10-15') },
  { id: '4', name: 'Esmalte Vermelho', category: 'Unhas', quantity: 8, minQuantity: 10, unit: 'un', costPrice: 3.50, salePrice: 8.00, supplier: 'Nail Supply', lastPurchase: new Date('2024-11-10'), expirationDate: new Date('2027-11-10') },
  { id: '5', name: 'Esmalte Rosa', category: 'Unhas', quantity: 6, minQuantity: 10, unit: 'un', costPrice: 3.50, salePrice: 8.00, supplier: 'Nail Supply', lastPurchase: new Date('2024-11-10'), expirationDate: new Date('2027-11-10') },
  { id: '6', name: 'Gel para Unhas', category: 'Unhas', quantity: 15, minQuantity: 20, unit: 'un', costPrice: 45.00, salePrice: 85.00, supplier: 'Nail Supply', lastPurchase: new Date('2024-10-20'), expirationDate: new Date('2025-10-20') },
  { id: '7', name: 'Acetona', category: 'Unhas', quantity: 25, minQuantity: 15, unit: 'un', costPrice: 4.00, salePrice: 10.00, supplier: 'Nail Supply', lastPurchase: new Date('2024-11-05'), expirationDate: new Date('2026-11-05') },
  { id: '8', name: 'Creme Hidratante Facial', category: 'Estética', quantity: 18, minQuantity: 10, unit: 'un', costPrice: 35.00, salePrice: 70.00, supplier: 'Cosméticos Premium', lastPurchase: new Date('2024-10-25'), expirationDate: new Date('2026-10-25') },
  { id: '9', name: 'Máscara Facial', category: 'Estética', quantity: 5, minQuantity: 10, unit: 'un', costPrice: 28.00, salePrice: 55.00, supplier: 'Cosméticos Premium', lastPurchase: new Date('2024-10-10'), expirationDate: new Date('2025-10-10') },
  { id: '10', name: 'Protetor Solar FPS 50', category: 'Estética', quantity: 22, minQuantity: 15, unit: 'un', costPrice: 42.00, salePrice: 80.00, supplier: 'Cosméticos Premium', lastPurchase: new Date('2024-11-01'), expirationDate: new Date('2025-11-01') },
  { id: '11', name: 'Base Líquida', category: 'Maquiagem', quantity: 14, minQuantity: 10, unit: 'un', costPrice: 55.00, salePrice: 120.00, supplier: 'Makeup Store', lastPurchase: new Date('2024-10-30'), expirationDate: new Date('2026-10-30') },
  { id: '12', name: 'Batom Vermelho', category: 'Maquiagem', quantity: 9, minQuantity: 10, unit: 'un', costPrice: 18.00, salePrice: 45.00, supplier: 'Makeup Store', lastPurchase: new Date('2024-11-05'), expirationDate: new Date('2027-11-05') },
  { id: '13', name: 'Pó Compacto', category: 'Maquiagem', quantity: 12, minQuantity: 10, unit: 'un', costPrice: 32.00, salePrice: 75.00, supplier: 'Makeup Store', lastPurchase: new Date('2024-10-28'), expirationDate: new Date('2026-10-28') },
  { id: '14', name: 'Óleo para Massagem', category: 'Massagem', quantity: 20, minQuantity: 15, unit: 'un', costPrice: 38.00, salePrice: 70.00, supplier: 'Wellness Products', lastPurchase: new Date('2024-11-01'), expirationDate: new Date('2026-11-01') },
  { id: '15', name: 'Toalha Descartável', category: 'Geral', quantity: 500, minQuantity: 200, unit: 'un', costPrice: 0.50, salePrice: 1.50, supplier: 'Suprimentos Gerais', lastPurchase: new Date('2024-11-15'), expirationDate: undefined },
  { id: '16', name: 'Luvas Descartáveis', category: 'Geral', quantity: 300, minQuantity: 200, unit: 'un', costPrice: 0.30, salePrice: 1.00, supplier: 'Suprimentos Gerais', lastPurchase: new Date('2024-11-15'), expirationDate: undefined },
  { id: '17', name: 'Algodão', category: 'Geral', quantity: 150, minQuantity: 100, unit: 'un', costPrice: 8.00, salePrice: 18.00, supplier: 'Suprimentos Gerais', lastPurchase: new Date('2024-11-10'), expirationDate: undefined },
  { id: '18', name: 'Álcool 70%', category: 'Geral', quantity: 30, minQuantity: 20, unit: 'un', costPrice: 12.00, salePrice: 25.00, supplier: 'Suprimentos Gerais', lastPurchase: new Date('2024-11-05'), expirationDate: new Date('2025-11-05') },
  { id: '19', name: 'Escova de Cabelo', category: 'Cabelo', quantity: 25, minQuantity: 15, unit: 'un', costPrice: 15.00, salePrice: 35.00, supplier: 'Distribuidora Beleza', lastPurchase: new Date('2024-10-20'), expirationDate: undefined },
  { id: '20', name: 'Secador de Cabelo', category: 'Cabelo', quantity: 3, minQuantity: 2, unit: 'un', costPrice: 180.00, salePrice: 350.00, supplier: 'Equipamentos Beleza', lastPurchase: new Date('2024-09-15'), expirationDate: undefined },
];

