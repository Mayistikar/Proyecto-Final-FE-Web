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
  selectedImageFile: File | null = null; // Add this property

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private router: Router,
    private translate: TranslateService
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
  }

  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    // Store the selected file
    this.selectedImageFile = file;

    // Create local preview using FileReader
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      this.productForm.patchValue({ imageUrl: 'placeholder-url' }); // Set a placeholder URL or remove if not needed
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.snackBar.open(this.translate.instant('FORM.INVALID'), 'OK', { duration: 3000 });
      return;
    }

    this.loading = true;

    const formValue = this.productForm.value;
    const product = new Product(
      '',
      formValue.name,
      formValue.description,
      formValue.category,
      formValue.price,
      formValue.imageUrl,
      formValue.stock,
      formValue.sku,
      formValue.expirationDate,
      formValue.deliveryTime,
      formValue.storageConditions,
      formValue.commercialConditions,
      formValue.perishable
    );

    this.productService.createProduct(product, this.selectedImageFile || undefined).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('PRODUCT.CREATED_SUCCESS'), 'OK', { duration: 3000 });
        console.log({ formValue });
        console.log({ product });
        this.loading = false;
        // this.router.navigate(['manufacturer-dashboard']);
      },
      error: () => {
        this.snackBar.open(this.translate.instant('PRODUCT.CREATED_ERROR'), 'OK', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['manufacturer-dashboard']);
  }
}
