// seller.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Seller } from './seller.model';

export const SELLER_API_URL = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/auth/seller';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private apiUrl = SELLER_API_URL;

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

    return this.http.post(this.apiUrl, payload);
  }
}
