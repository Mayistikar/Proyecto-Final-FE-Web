export interface PerformanceKpi {
  sellerId?: string;
  sellerName?: string;
  clientCount: number;
  totalSales: number;
  monthlySales: number;
  quarterlySales: number;
  currency?: string;           
  startDate?: string;           
  endDate?: string;
}