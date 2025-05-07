// src/app/seller/seller.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Seller } from './seller.model';

const BASE_URL = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod';

interface BackendSeller {
  id:               string;
  full_name:        string;
  email:            string;
  phone?:           string;
  address?:         string;
  sector_coverage?: string;
  experience?:      string;
}

@Injectable({ providedIn: 'root' })
export class SellerService {

  constructor(private http: HttpClient) {}


  getAll(): Observable<Seller[]> {
    return this.http
      .get<any[]>(`${BASE_URL}/auth/users?role=seller`)
      .pipe(
        map(users => users.map(this.mapAuthUserToSeller)),
        catchError(() =>               // si auth/users falla
          this.http
            .get<BackendSeller[]>(`${BASE_URL}/api/sellers`)
            .pipe(
              map(list => list.map(this.mapToSeller)),
              catchError(() => of([]))
            )
        )
      );
  }
  
  private mapAuthUserToSeller = (u: any): Seller => ({
    id:        u.id,
    name:      u.profile?.full_name?.trim() || u.email,
    email:     u.email,
    phone:     u.profile?.phone        ?? '',
    address:   u.profile?.address      ?? '',
    zone:      u.profile?.sector_coverage ?? '',
    specialty: u.profile?.experience   ?? '',
    password:  ''
  });
  
  private mapToSeller = (s: BackendSeller): Seller => ({
    id:        s.id,
    name:      s.full_name?.trim() || s.email,
    email:     s.email,
    phone:     s.phone          ?? '',
    address:   s.address        ?? '',
    zone:      s.sector_coverage?? '',
    specialty: s.experience     ?? '',
    password:  ''
  });

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

    return this.http.post(`${BASE_URL}/api/create_seller`, payload);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${BASE_URL}/auth/login`, credentials);
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${BASE_URL}/api/sellers/${id}`);
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
