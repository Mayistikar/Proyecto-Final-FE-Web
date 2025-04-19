// src/app/models/sales-plan.model.spec.ts
import { SalesPlan } from './sales-plan.model';
import { faker } from '@faker-js/faker';

describe('SalesPlan Model', () => {
  it('should create a SalesPlan with default values', () => {
    const plan = new SalesPlan();

    expect(plan.id).toBe('');
    expect(plan.sellerId).toBe('');
    expect(plan.name).toBe('');
    expect(plan.description).toBe('');
    expect(plan.dailyGoal).toBe(0);
    expect(plan.weeklyGoal).toBe(0);
    expect(plan.startTime).toBe('');
    expect(plan.endTime).toBe('');
    expect(plan.visitRoute).toBe('');
    expect(plan.strategy).toBe('');
    expect(plan.event).toBe('');
    expect(plan.createdAt).toBe('');
  });

  it('should create a SalesPlan with custom values', () => {
    const mockPlan = new SalesPlan(
      faker.string.uuid(),
      faker.string.uuid(),
      'Plan Demo',
      'Descripción del plan',
      5,
      25,
      '08:00',
      '17:00',
      'ROUTE_BOGOTA_NORTE',
      'DIRECT_PROMOTION',
      'LOCAL_CONCERT',
      new Date().toISOString()
    );

    expect(mockPlan.name).toBe('Plan Demo');
    expect(mockPlan.dailyGoal).toBe(5);
    expect(mockPlan.visitRoute).toBe('ROUTE_BOGOTA_NORTE');
    expect(mockPlan.strategy).toBe('DIRECT_PROMOTION');
  });
});