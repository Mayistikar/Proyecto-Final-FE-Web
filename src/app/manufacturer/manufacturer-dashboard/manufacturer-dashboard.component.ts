// manufacturer-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../services/product.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-manufacturer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './manufacturer-dashboard.component.html',
  styleUrls: ['./manufacturer-dashboard.component.scss']
})
export class ManufacturerDashboardComponent implements OnInit {
  manufacturerName: string = '';
  products: Product[] = [];
  loading = false;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const manufacturer = this.authService.getCurrentManufacturer();
    if (manufacturer) {
      this.manufacturerName = manufacturer.companyName ?? '';
      this.productService.getProductsByManufacturer(manufacturer.id).subscribe({
        next: (data) => {
          this.products = data;
          this.loading = false;
        },
        error: () => {
          console.error('Error loading products');
          this.loading = false;
        }
      });
    } else {
      this.router.navigate(['/manufacturer']);
    }
  }

  viewProductDetail(productId: string): void {
    this.router.navigate([`/manufacturer/product/${productId}`]);
  }
}
