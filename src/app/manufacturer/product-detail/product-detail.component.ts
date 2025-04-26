// product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../services/product.service';
import { Product } from '../../models/product.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr'; 

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  productId!: string;
  product!: Product;
  loading = true;
  loadError = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private translate: TranslateService,
    private toastr: ToastrService 
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id')!;

    this.productService.getProductById(this.productId).subscribe({
      next: (data) => {
        if (!data) {
          this.handleLoadError();
          return;
        }
        this.product = {
          id: data.id,
          name: data.name,
          description: data.description,
          category: data.category,
          price: data.price,
          currency: data.currency,
          stock: data.stock,
          sku: data.sku,
          expirationDate: data.expiration_date,
          deliveryTime: data.delivery_time,
          storageConditions: data.storage_conditions,
          commercialConditions: data.commercial_conditions,
          isPerishable: data.is_perishable,
          imageUrl: data.image,
          manufacturerId: data.manufacturer_id,
          warehouse: data.warehouse,
        };
        this.loading = false;
        this.toastr.success(
          this.translate.instant('PRODUCT_LOAD_SUCCESS'),
          this.translate.instant('COMMON.SUCCESS'),
          { timeOut: 3000 }
        );
      },
      error: () => {
        this.handleLoadError();
      }
    });
  }

  private handleLoadError(): void {
    this.loadError = true;
    this.loading = false;
    this.toastr.error(
      this.translate.instant('PRODUCT_LOAD_ERROR'),
      this.translate.instant('COMMON.ERROR'),
      { timeOut: 4000 }
    );
  }

  editProduct(): void {
    this.router.navigate([`/manufacturer/edit-product/${this.productId}`]);
  }

  cancel(): void {
    this.router.navigate(['/manufacturer-dashboard']);
  }
}
