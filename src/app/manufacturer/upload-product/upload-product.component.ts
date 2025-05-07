import {Component, OnInit } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {KeyValuePipe, CommonModule} from '@angular/common';
import {ProductService} from '../services/product.service';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../auth/auth.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-upload-product',
  imports: [
    TranslatePipe,
    KeyValuePipe,
    CommonModule,
    MatSnackBarModule,
    TranslateModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './upload-product.component.html',
  styleUrl: './upload-product.component.css'
})
export class UploadProductComponent implements OnInit{

  jsonData: any[] = [];
  isFileUploaded: boolean = false;
  isUploading: boolean = false;
  fileErrors: string[] = [];
  uploadErrors: string[] = [];
  userCountry?: string | null = '';
  userId?: string | null = '';
  warehouses: any[] = [];
  warehouseSelected: string = '';

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.userCountry = this.authService.getUserCountry()?.split("_")[1];
    this.userId = this.authService.getUserId();
    console.log('User ID:', this.userId);
    console.log('User Country:', this.userCountry);
  
    this.loadWarehouses(); 
  }
  

private loadWarehouses(): void {
  if (this.userCountry) {
    this.productService.getWarehouses().subscribe({
      next: (warehouses) => {
        console.log('Warehouses sin filtro:', warehouses);
        this.warehouses = warehouses;
      },
      error: (err) => {
        console.error('Error loading all warehouses:', err);
      }
    });
  } else {
    console.warn('No country found for current user');
    this.productService.getWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
      },
      error: (err) => {
        console.error('Fallback: Error loading all warehouses:', err);
      }
    });
  }
}

  downloadFile(): void {
    const link = document.createElement('a');
    link.href = 'https://assetsccp.s3.us-east-1.amazonaws.com/plantilla_2.0.csv';
    link.download = 'sample-file.pdf';
    link.click();
  }

  uploadFile(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input?.files?.length) {
      const file = input.files[0];

      const reader = new FileReader();

      reader.onload = (e) => {
        const csvData = e.target?.result as string;
        const validationResult = this.validateCsvStructure(csvData);
        if (!validationResult.isValid) {
          this.fileErrors = validationResult.errors;
        }

        this.jsonData = this.csvToJson(csvData);
        this.isFileUploaded = true;
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };

      reader.readAsText(file);
    } else {
      console.error('No file selected');
    }
  }

  private csvToJson(csv: string): any[] {
    const lines = csv.split('\n');
    const headers = lines[0].split(';');

    return lines.slice(1)
      .filter((line) => line.trim() !== '') // Filtrar filas vacías
      .map((line) => {
        const values = line.split(';');
        return headers.reduce((acc, header, index) => {
          acc[header.trim()] = values[index]?.trim();
          return acc;
        }, {} as Record<string, string>);
      });
  }

  clean() {
    this.jsonData = [];
    this.isFileUploaded = false;
    this.fileErrors = [];
  }

  uploadProducts() {
    if (this.jsonData.length === 0) {
      alert('No products to upload.');
      return;
    }

    if (this.warehouseSelected === undefined) {
      this.snackBar.open(this.translate.instant('SELECT_WAREHOUSE'), 'OK', {
        duration: 3000,
        panelClass: 'snackbar-error'
      });
      return;
    }

    this.jsonData = this.jsonData.map((item => {
      return {
        ...item,
        warehouse: this.warehouseSelected,
        manufacturer_id: this.userId,
        country: this.userCountry,
      };
    }));

    this.isUploading = true;
    this.productService.sendProducts(this.jsonData).subscribe({
      next: (response) => {
        this.snackBar.open(this.translate.instant('FILE_UPLOAD_SUCCESS'), 'OK', {
          duration: 3000,
          panelClass: 'snackbar-success'
        });
        this.isUploading = false;
        this.clean();
        this.router.navigate(['manufacturer-dashboard']);
      },
      error: (error) => {
        this.uploadErrors.push( this.translate.instant('FILE_UPLOAD_SUCCESS') );
        this.isUploading = false;
      }
    });

  }

  private validateCsvStructure(csv: string): { isValid: boolean; errors: string[] } {
    const expectedHeaders = [
      "name", "description", "category", "price", "currency", "is_perishable", "stock", "sku",
      "expiration_date", "delivery_time", "storage_conditions", "image", "commercial_conditions"
    ];

    const lines = csv.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      return {isValid: false, errors: ['CSV file is empty or has no data.']};
    }
    const headers = lines[0].split(';').map(header => header.trim());
    const errors: string[] = [];

    if (headers.length !== expectedHeaders.length || !headers.every((header, index) => header === expectedHeaders[index])) {
      errors.push(`Expected Headers: ${expectedHeaders.join('\n')}`);
      return {isValid: false, errors};
    }

    lines.slice(1).forEach((line, rowIndex) => {
      const values = line.split(';');
      if (values.length !== expectedHeaders.length) {
        errors.push(`Row ${rowIndex + 2}: Incorrect number of columns.`);
        return;
      }

      const [name, description, category, price, currency, is_perishable, stock, sku, expiration_date, delivery_time, storage_conditions, image, commercial_conditions] = values;

      if (!name.trim()) errors.push(`Row ${rowIndex + 1}: "name" is required.`);
      if (!description.trim()) errors.push(`Row ${rowIndex + 1}: "description" is required.`);
      if (!category.trim()) errors.push(`Row ${rowIndex + 1}: "category" is required.`);
      if (isNaN(parseFloat(price))) errors.push(`Row ${rowIndex + 1}: "price" must be a valid number.`);
      if (!currency.trim()) errors.push(`Row ${rowIndex + 1}: "currency" is required.`);
      if (isNaN(parseInt(stock))) errors.push(`Row ${rowIndex + 1}: "stock" must be a valid integer.`);
      if (!sku.trim()) errors.push(`Row ${rowIndex + 1}: "sku" is required.`);
      if (isNaN(Date.parse(expiration_date))) errors.push(`Row ${rowIndex + 1}: "expiration_date" must be a valid date.`);
      if (isNaN(parseInt(delivery_time))) errors.push(`Row ${rowIndex + 1}: "delivery_time" must be a valid integer.`);
      if (!storage_conditions.trim()) errors.push(`Row ${rowIndex + 1}: "storage_conditions" is required.`);
      if (!commercial_conditions.trim()) errors.push(`Row ${rowIndex + 1}: "commercial_conditions" is required.`);
      if (!["TRUE", "FALSE"].includes(is_perishable.trim().toUpperCase())) {
        errors.push(`Row ${rowIndex + 1}: "is_perishable" must be either TRUE or FALSE.`);
      }
    });

    return {isValid: errors.length === 0, errors};
  }

  deleteFile() {
    this.jsonData = [];
    this.fileErrors = [];
    this.isFileUploaded = false;
  }
}
