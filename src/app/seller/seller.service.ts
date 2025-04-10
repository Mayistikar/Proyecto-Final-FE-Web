// seller.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Seller } from './seller.model';

const BASE_URL = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  constructor(private http: HttpClient) {}

  register(seller: Seller): Observable<any> {
    const payload = {
      email: seller.email,
      password: seller.password,
      confirm_password: seller.password,
      full_name: seller.name,
      phone: seller.phone,
      address: seller.address,
      sector_coverage: seller.zone,
      experience: seller.specialty
    };

    return this.http.post(`${BASE_URL}/auth/seller`, payload);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${BASE_URL}/auth/login`, credentials);
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${BASE_URL}/auth/users`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${BASE_URL}/api/stats`);
  }

  checkHealth(): Observable<any> {
    return this.http.get(`${BASE_URL}/api/health`);
  }

  deleteDatabase(): Observable<any> {
    return this.http.delete(`${BASE_URL}/api/delete_database`);
  }
}