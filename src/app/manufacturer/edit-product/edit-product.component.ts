// edit-product.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../services/product.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {
  productForm!: FormGroup;
  loading = false;
  imagePreview: string | ArrayBuffer | null = null;
  selectedImageFile: File | null = null;
  productId!: string;
  warehouses: { id: string; name: string; country: string }[] = [];
  currencies = ['COP', 'USD'];
  minExpirationDate: Date = new Date();
  isPerishable = false;
  initialProductData: any; 

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private translate: TranslateService, 
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id')!;
    this.initForm();

    this.productService.getProductById(this.productId).subscribe(product => {
      const normalized = {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        currency: product.currency,
        stock: product.stock,
        sku: product.sku,
        expirationDate: product.expiration_date,
        deliveryTime: product.delivery_time,
        storageConditions: product.storage_conditions,
        commercialConditions: product.commercial_conditions,
        warehouse: product.warehouse,
        perishable: product.is_perishable,
        imageUrl: product.image
      };
      this.productForm.patchValue(normalized);
      this.initialProductData = normalized; 
      this.imagePreview = product.image;
      this.isPerishable = product.is_perishable;
    });

    this.productService.getWarehouses().subscribe({
      next: (data) => (this.warehouses = data),
      error: () =>
        this.toastr.error(
          this.translate.instant('WAREHOUSE.LOAD_ERROR'),
          this.translate.instant('COMMON.ERROR'),
          { timeOut: 3000 }
        ),
    });
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['COP', Validators.required],
      stock: [null, [Validators.required, Validators.min(0)]],
      sku: ['', Validators.required],
      expirationDate: [''],
      deliveryTime: [null, [Validators.required, Validators.min(1)]],
      storageConditions: ['', Validators.required],
      commercialConditions: ['', Validators.required],
      warehouse: ['', Validators.required],
      perishable: [false],
      imageUrl: ['']
    });

    this.productForm.get('perishable')?.valueChanges.subscribe(isPerishable => {
      const exp = this.productForm.get('expirationDate');
      if (isPerishable) {
        exp?.setValidators(Validators.required);
      } else {
        exp?.clearValidators();
        exp?.setValue(null);
      }
      exp?.updateValueAndValidity();
    });

    this.productForm.get('expirationDate')?.valueChanges.subscribe(value => {
      if (value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          this.productForm.get('expirationDate')?.setErrors({ invalidDate: true });
        }
      }
    });
  }

  fieldIsInvalid(field: string): boolean {
    const control = this.productForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.productForm.patchValue({ imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  private isFormChanged(): boolean {
    const current = this.productForm.getRawValue();
    return JSON.stringify(current) !== JSON.stringify(this.initialProductData);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markAllFieldsAsTouched();
      this.toastr.error(
        this.translate.instant('FORM.INVALID'),
        this.translate.instant('COMMON.ERROR'),
        { timeOut: 3000 }
      );
      return;
    }

    if (!this.isFormChanged()) {
      this.toastr.info(
        this.translate.instant('FORM.NO_CHANGES'),
        this.translate.instant('COMMON.INFO'),
        { timeOut: 3000 }
      );
      return;
    }

    this.loading = true;
    const formValue = this.productForm.value;

    const payload = {
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      category: formValue.category,
      is_perishable: formValue.perishable,
      stock: formValue.stock,
      expiration_date: formValue.expirationDate,
      delivery_time: formValue.deliveryTime,
      storage_conditions: formValue.storageConditions,
      image: formValue.imageUrl,
      commercial_conditions: formValue.commercialConditions,
      currency: formValue.currency,
      manufacturer_id: this.authService.getUserId(),
      country: 'Colombia',
      sku: formValue.sku,
      warehouse: formValue.warehouse
    };

    this.productService.updateProduct(this.productId, payload).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('PRODUCT_SAVE_SUCCESS'),
          this.translate.instant('COMMON.SUCCESS'),
          { timeOut: 3000 }
        );
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['manufacturer-dashboard']);
        }, 2000);
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('PRODUCT_SAVE_ERROR'),
          this.translate.instant('COMMON.ERROR'),
          { timeOut: 3000 }
        );
        this.loading = false;
      }
    });
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach((field) => {
      const control = this.productForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  onCancel(): void {
    this.router.navigate(['manufacturer-dashboard']);
  }
}