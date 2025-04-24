import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-warehouse',
  imports: [
    FormsModule,
    NgForOf,
    TranslatePipe,
    CurrencyPipe,
    DatePipe,
    NgIf
  ],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.css'
})
export class WarehouseComponent {
  products: any[] = [];
  userName: string = '';

  constructor(private http: HttpClient) {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      this.userName = parsedData.email || '';
    }
  }


  isLoading = true;
  skeletonRows = Array(5); // Número de filas de skeleton a mostrar

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.http.get<any[]>('https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api/products')
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
}
