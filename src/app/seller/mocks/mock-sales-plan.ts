import { SalesPlan } from '../../models/sales-plan.model';

export const MOCK_SALES_PLAN: SalesPlan = {
  id: 'mock-id',
  sellerId: 'seller-id',
  name: 'Test Sales Plan',
  description: 'Plan simulado para desarrollo',
  visitRoute: 'ROUTE_BOGOTA_CHAPINERO',
  dailyGoal: 10,
  weeklyGoal: 60,
  startTime: '08:30',
  endTime: '17:30',
  strategy: 'BULK_DISCOUNT',
  event: 'LOCAL_CONCERT',
  createdAt: new Date().toISOString()
};