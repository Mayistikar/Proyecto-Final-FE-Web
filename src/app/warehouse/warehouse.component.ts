import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {CurrencyPipe, DatePipe, KeyValuePipe, NgForOf, NgIf} from "@angular/common";
import { TranslatePipe } from "@ngx-translate/core";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-warehouse',
  imports: [
    FormsModule,
    NgForOf,
    TranslatePipe,
    CurrencyPipe,
    DatePipe,
    NgIf,
    KeyValuePipe
  ],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.css'
})
export class WarehouseComponent {
  products: any[] = [];
  userName: string = '';
  warehouses: Record<string, any> = {};
  countries: string[] = ['Colombia', 'Estados Unidos'];
  searchTerm: string = '';
  selectedCountry: string = '';
  selectedWarehouse: string = '';

  constructor(private http: HttpClient) {
    const userEmail = localStorage.getItem('user_email');
    if (userEmail) {
      this.userName = userEmail || '';
    }
  }

  isLoading = true;
  skeletonRows = Array(5);

  ngOnInit(): void {
    this.fetchProducts();
    this.fetchWarehouses();
  }

  fetchProducts(): void {
    this.http.get<any[]>('https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api/products/search')
      .subscribe({
        next: (data) => {
          this.products = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching products:', error);
          this.isLoading = false;
        }
      });
  }

  fetchWarehouses(): void {
    this.http.get<any[]>('https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api/warehouses')
      .subscribe({
        next: (data) => {
          this.warehouses = data.reduce((acc, warehouse) => {
            acc[warehouse.id] = warehouse;
            return acc;
          }, {} as Record<string, any>);
        },
        error: (error) => {
          console.error('Error fetching warehouses:', error);
        }
      });
  }

  getWarehouseName(warehouseId: string): string {
    return this.warehouses[warehouseId]?.name || 'Unknown Warehouse';
  }

  get filteredProducts(): any[] {
    return this.products.filter(product => {
      const matchesSearchTerm = product?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product?.sku?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product?.category?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCountry = !this.selectedCountry || product?.country === this.selectedCountry;
      const matchesWarehouse = !this.selectedWarehouse || product?.warehouse === this.selectedWarehouse;

      return matchesSearchTerm && matchesCountry && matchesWarehouse;
    });
  }
}
