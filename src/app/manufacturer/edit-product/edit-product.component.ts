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
  productId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id')!;
    this.initForm();

    this.productService.getProductById(this.productId).subscribe(product => {
      this.productForm.patchValue(product);
      this.imagePreview = product.imageUrl;
    });
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      sku: ['', Validators.required],
      expirationDate: [''],
      deliveryTime: [null, Validators.required],
      storageConditions: ['', Validators.required],
      commercialConditions: ['', Validators.required],
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

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.snackBar.open(this.translate.instant('FORM.INVALID'), 'OK', { duration: 3000 });
      return;
    }

    this.loading = true;
    const updatedProduct: Product = this.productForm.value;

    this.productService.updateProduct(this.productId, updatedProduct).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('PRODUCT_SAVE_SUCCESS'), 'OK', { duration: 3000 });
        this.router.navigate(['/manufacturer/dashboard']);
      },
      error: () => {
        this.snackBar.open(this.translate.instant('PRODUCT_SAVE_ERROR'), 'OK', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/manufacturer/dashboard']);
  }
}