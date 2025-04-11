// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Product } from '../../models/product.model';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api';

  constructor(private http: HttpClient) {}

  createProduct(product: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/products`, product, { headers });
  }

  getProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products`);
  }

  getProductById(productId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/${productId}`);
  }

  updateProduct(productId: string, product: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(`${this.baseUrl}/products/${productId}`, product, { headers });
  }

  getPresignedUrl(fileName: string): Observable<{ uploadUrl: string; publicUrl: string }> {
    const url = `https://assetsccp.s3.us-east-1.amazonaws.com/${fileName}`;
    return of({
      uploadUrl: url,  
      publicUrl: url,  
    });
  }

  uploadToS3(uploadUrl: string, file: File): Observable<any> {
    return this.http.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  }

  getProductsByManufacturer(manufacturerId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products?manufacturerId=${manufacturerId}`);
  }
}
