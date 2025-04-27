// src/app/models/sales-plan.model.ts

export class SalesPlan {
    id: string;
    sellerId: string;
    name: string; 
    description: string; 
    dailyGoal: number;
    weeklyGoal: number;
    startTime: string;
    endTime: string;
    visitRoute: string;
    strategy: string;
    event: string;
    createdAt: string;
  
    constructor(
      id: string = '',
      sellerId: string = '',
      name: string = '', 
      description: string = '', 
      dailyGoal: number = 0,
      weeklyGoal: number = 0,
      startTime: string = '',
      endTime: string = '',
      visitRoute: string = '',
      strategy: string = '',
      event: string = '',
      createdAt: string = ''
    ) {
      this.id = id;
      this.sellerId = sellerId;
      this.name = name;
      this.description = description;
      this.dailyGoal = dailyGoal;
      this.weeklyGoal = weeklyGoal;
      this.startTime = startTime;
      this.endTime = endTime;
      this.visitRoute = visitRoute;
      this.strategy = strategy;
      this.event = event;
      this.createdAt = createdAt;
    }
  }