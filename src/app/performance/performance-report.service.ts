// src/app/performance/performance-report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PerformanceKpi } from '../models/performance-report.model';

interface BackendReport {
  seller_id:   string;
  seller_name: string;
  clients:     number;
  sells:       number;
  month_sells: number;
  quarterly:   number;
  currency:    string;
}

@Injectable({ providedIn: 'root' })
export class PerformanceReportService {

  private readonly API     = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api';
  private readonly REPORTS = `${this.API}/reports`;

  constructor(private http: HttpClient) {}

  getAll(start?: string, end?: string): Observable<PerformanceKpi[]> {
    return this.http
      .get<BackendReport[]>(this.REPORTS, { params: this.range(start, end) })
      .pipe(map(list => list.map(this.toKpi)));
  }

  getBySeller(
    sellerId: string,
    start?: string,
    end?: string
  ): Observable<PerformanceKpi | null> {
    return this.getAll(start, end).pipe(
      map(list => list.find(k => k.sellerId === sellerId) ?? null)
    );
  }

  getSummary(start?: string, end?: string): Observable<PerformanceKpi> {
    return this.getAll(start, end).pipe(
      map(list =>
        list.reduce<PerformanceKpi>(
          (acc, cur) => ({
            sellerId:        'GLOBAL',
            sellerName:      'Global',
            clientCount:     acc.clientCount    + cur.clientCount,
            totalSales:      acc.totalSales     + cur.totalSales,
            monthlySales:    acc.monthlySales   + cur.monthlySales,
            quarterlySales:  acc.quarterlySales + cur.quarterlySales,
            currency:        cur.currency || acc.currency
          }),
          { sellerId:'GLOBAL', sellerName:'Global', clientCount:0,
            totalSales:0, monthlySales:0, quarterlySales:0, currency:'usd' }
        )
      )
    );
  }

  private readonly toKpi = (r: BackendReport): PerformanceKpi => ({
    sellerId:        r.seller_id,
    sellerName:      r.seller_name,
    clientCount:     r.clients,
    totalSales:      r.sells,
    monthlySales:    r.month_sells,
    quarterlySales:  r.quarterly,
    currency:        r.currency ?? 'usd'
  });

  private range(start?: string, end?: string): HttpParams {
    let p = new HttpParams();
    if (start) p = p.set('startDate', start);
    if (end)   p = p.set('endDate',   end);
    return p;
  }
}
