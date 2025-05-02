import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerformanceKpi } from '../models/performance-report.model';

const API = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api';
const PERFORMANCE = `${API}/v1/reports/performance`;

@Injectable({ providedIn: 'root' })
export class PerformanceReportService {

  constructor(private http: HttpClient) {}


  getGlobal(start?: string, end?: string): Observable<PerformanceKpi[]> {
    return this.http.get<PerformanceKpi[]>(PERFORMANCE, {
      params: this.range(start, end)
    });
  }

  getGlobalMonthly(start?: string, end?: string): Observable<PerformanceKpi[]> {
    return this.http.get<PerformanceKpi[]>(`${PERFORMANCE}/months`, {
      params: this.range(start, end)
    });
  }

  getGlobalQuarterly(start?: string, end?: string): Observable<PerformanceKpi[]> {
    return this.http.get<PerformanceKpi[]>(`${PERFORMANCE}/quarters`, {
      params: this.range(start, end)
    });
  }

  getBySeller(start?: string, end?: string): Observable<PerformanceKpi[]> {
    return this.http.get<PerformanceKpi[]>(`${PERFORMANCE}/sellers`, {
      params: this.range(start, end)
    });
  }


  getSellerDetail(
    sellerId: string,
    start?: string,
    end?: string
  ): Observable<PerformanceKpi> {
    return this.http.get<PerformanceKpi>(`${PERFORMANCE}/sellers/${sellerId}`, {
      params: this.range(start, end)
    });
  }

  getSellerMonthly(
    sellerId: string,
    start?: string,
    end?: string
  ): Observable<PerformanceKpi[]> {
    return this.http.get<PerformanceKpi[]>(
      `${PERFORMANCE}/sellers/${sellerId}/months`,
      { params: this.range(start, end) }
    );
  }

  getSellerQuarterly(
    sellerId: string,
    start?: string,
    end?: string
  ): Observable<PerformanceKpi[]> {
    return this.http.get<PerformanceKpi[]>(
      `${PERFORMANCE}/sellers/${sellerId}/quarters`,
      { params: this.range(start, end) }
    );
  }

  private range(start?: string, end?: string): HttpParams {
    let params = new HttpParams();
    if (start) params = params.set('startDate', start);
    if (end)   params = params.set('endDate',   end);
    return params;
  }
}