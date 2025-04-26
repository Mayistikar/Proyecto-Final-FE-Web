import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../services/product.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule,
    TranslateModule,
  ],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit {
  productForm!: FormGroup;
  loading = false;
  imagePreview: string | ArrayBuffer | null = null;
  isPerishable = false;
  selectedImageFile: File | null = null;
  warehouses: { id: string; name: string; country: string }[] = [];
  currencies = ['COP', 'USD'];
  minExpirationDate: Date = new Date();


  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      imageUrl: ['', Validators.required],
      stock: [null, [Validators.required, Validators.min(0)]],
      sku: ['', Validators.required],
      expirationDate: [''],
      deliveryTime: [null, [Validators.required, Validators.min(1)]],
      storageConditions: ['', Validators.required],
      commercialConditions: ['', Validators.required],
      perishable: [false],
      currency: ['COP', Validators.required],
      warehouse: ['', Validators.required],
      country: ['Colombia']
    });

    this.productForm.get('perishable')?.valueChanges.subscribe((isPerishable) => {
      this.isPerishable = isPerishable;
      const expirationDateControl = this.productForm.get('expirationDate');
      if (isPerishable) {
        expirationDateControl?.setValidators(Validators.required);
      } else {
        expirationDateControl?.clearValidators();
        expirationDateControl?.setValue(null);
      }
      expirationDateControl?.updateValueAndValidity();
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

    this.productService.getWarehouses().subscribe({
      next: (data) => this.warehouses = data,
      error: () => {
        this.toastr.error(
          this.translate.instant('WAREHOUSE.LOAD_ERROR'),
          this.translate.instant('COMMON.ERROR'),
          { timeOut: 3000 }
        );
      }
    });
  }

  fieldIsInvalid(field: string): boolean {
    const control = this.productForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    this.selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      this.productForm.patchValue({ imageUrl: file.name });
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markAllFieldsAsTouched();
      this.toastr.error(this.translate.instant('FORM.INVALID'), this.translate.instant('COMMON.ERROR'), { timeOut: 3000 });
      return;
    }

    this.loading = true;

    const manufacturerId = this.authService.getUserId();
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
      manufacturer_id: manufacturerId,
      country: formValue.country,
      sku: formValue.sku,
      warehouse: formValue.warehouse
    };

    this.productService.createProduct(payload, this.selectedImageFile || undefined).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('PRODUCT_CREATED_SUCCESS'),
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
          this.translate.instant('PRODUCT_CREATED_ERROR'),
          this.translate.instant('COMMON.ERROR'),
          { timeOut: 3000 }
        );
        this.loading = false;
      },
    });
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(field => {
      const control = this.productForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  onCancel(): void {
    this.router.navigate(['manufacturer-dashboard']);
  }
}
