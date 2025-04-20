import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SalesPlan } from '../../models/sales-plan.model';
import { Observable, catchError, of } from 'rxjs';
import { MOCK_SALES_PLAN } from '../mocks/mock-sales-plan';

@Injectable({
  providedIn: 'root'
})
export class SalesPlanService {
  private baseUrl = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api';

  constructor(private http: HttpClient) {}

  create(plan: SalesPlan): Observable<SalesPlan> {
    return this.http.post<SalesPlan>(`${this.baseUrl}/sales-plans`, plan).pipe(
      catchError((error) => {
        console.warn('[DEV] ❌ create() falló, usando MOCK_SALES_PLAN:', error);
        const mocked = { ...MOCK_SALES_PLAN, ...plan };
        return of(mocked);
      })
    );
  }

  getSalesPlansBySeller(sellerId: string): Observable<SalesPlan[]> {
    return this.http.get<SalesPlan[]>(`${this.baseUrl}/sales-plans/seller/${sellerId}`).pipe(
      catchError((error) => {
        console.warn('[DEV] ❌ getSalesPlansBySeller() falló, usando MOCK:', error);
        return of([MOCK_SALES_PLAN]);
      })
    );
  }

  getById(id: string): Observable<SalesPlan> {
    if (id === 'mock-id') {
      console.warn('[DEV] Devolviendo MOCK_SALES_PLAN desde el servicio.');
      return of(MOCK_SALES_PLAN);
    }

    return this.http.get<SalesPlan>(`${this.baseUrl}/sales-plans/${id}`).pipe(
      catchError((error) => {
        console.warn('[DEV] ❌ getById() falló, usando MOCK:', error);
        return of(MOCK_SALES_PLAN);
      })
    );
  }

  update(id: string, plan: SalesPlan): Observable<SalesPlan> {
    return this.http.put<SalesPlan>(`${this.baseUrl}/sales-plans/${id}`, plan).pipe(
      catchError((error) => {
        console.warn('[DEV] ❌ update() falló, devolviendo plan original como MOCK:', error);
        return of(plan);
      })
    );
  }
}