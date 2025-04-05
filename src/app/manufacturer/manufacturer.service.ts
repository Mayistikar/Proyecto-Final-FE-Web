import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE_URL = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod';

@Injectable({
  providedIn: 'root'
})
export class ManufacturerService {

  constructor(private http: HttpClient) {}

  register(payload: any): Observable<any> {
    return this.http.post(`${BASE_URL}/auth/manufacturer`, payload);
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