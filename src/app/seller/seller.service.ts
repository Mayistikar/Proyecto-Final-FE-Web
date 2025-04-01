// seller.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Seller } from './seller.model';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private apiUrl = '/api/sellers';

  constructor(private http: HttpClient) {}

  register(seller: Seller): Observable<any> {
    return this.http.post(this.apiUrl, seller);
  }
}