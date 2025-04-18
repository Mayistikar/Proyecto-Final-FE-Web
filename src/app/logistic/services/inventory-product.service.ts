import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';


const BASE_URL = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod';

@Injectable({
  providedIn: 'root'
})
export class InventoryProductService {

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${BASE_URL}/api/products`);
  }
}
