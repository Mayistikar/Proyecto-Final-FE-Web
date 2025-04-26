import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { KeyValuePipe, CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-upload-product',
  imports: [
    TranslatePipe,
    KeyValuePipe,
    CommonModule,
    MatSnackBarModule,
    TranslateModule,
    RouterLink,
  ],
  templateUrl: './upload-product.component.html',
  styleUrl: './upload-product.component.css'
})
export class UploadProductComponent {

  jsonData: any[] = [];
  isFileUploaded: boolean = false;
  isUploading: boolean = false;
  fileErrors : string[] = [];

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private router: Router
  ) {}

  downloadFile(): void {
    const link = document.createElement('a');
    link.href = 'https://assetsccp.s3.us-east-1.amazonaws.com/plantilla.csv';
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

    return lines.slice(1).map((line) => {
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

    this.isUploading = true;
    this.productService.sendProducts(this.jsonData).subscribe({
      next: (response) => {
        this.snackBar.open(this.translate.instant('FILE_UPLOAD_SUCCESS'), 'OK', { duration: 3000, panelClass: 'snackbar-success' });
        this.isUploading = false;
        this.clean();
        this.router.navigate(['manufacturer-dashboard']);
      },
      error: (error) => {
        this.snackBar.open(this.translate.instant('FILE_UPLOAD_ERROR'), 'OK', { duration: 3000, panelClass: 'snackbar-error' });
        this.isUploading = false;
      }
    });
  }

  private validateCsvStructure(csv: string): { isValid: boolean; errors: string[] } {
    const expectedHeaders = [
      "name", "description", "category", "price", "currency", "stock", "sku",
      "expirationDate", "deliveryTime", "storageConditions", "commercialConditions", "isPerishable"
    ];

    const lines = csv.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(';').map(header => header.trim());
    const errors: string[] = [];

    // Validate headers
    if (headers.length !== expectedHeaders.length || !headers.every((header, index) => header === expectedHeaders[index])) {
      errors.push(`Expected Headers: ${expectedHeaders.join('\n')}`);
      return { isValid: false, errors };
    }

    // Validate rows
    lines.slice(1).forEach((line, rowIndex) => {
      const values = line.split(';');
      if (values.length !== expectedHeaders.length) {
        errors.push(`Row ${rowIndex + 2}: Incorrect number of columns.`);
        return;
      }

      const [name, description, category, price, currency, stock, sku, expirationDate, deliveryTime, storageConditions, commercialConditions, isPerishable] = values;

      if (!name.trim()) errors.push(`Row ${rowIndex + 1}: "name" is required.`);
      if (!description.trim()) errors.push(`Row ${rowIndex + 1}: "description" is required.`);
      if (!category.trim()) errors.push(`Row ${rowIndex + 1}: "category" is required.`);
      if (isNaN(parseFloat(price))) errors.push(`Row ${rowIndex + 1}: "price" must be a valid number.`);
      if (!currency.trim()) errors.push(`Row ${rowIndex + 1}: "currency" is required.`);
      if (isNaN(parseInt(stock))) errors.push(`Row ${rowIndex + 1}: "stock" must be a valid integer.`);
      if (!sku.trim()) errors.push(`Row ${rowIndex + 1}: "sku" is required.`);
      if (isNaN(Date.parse(expirationDate))) errors.push(`Row ${rowIndex + 1}: "expirationDate" must be a valid date.`);
      if (isNaN(parseInt(deliveryTime))) errors.push(`Row ${rowIndex + 1}: "deliveryTime" must be a valid integer.`);
      if (!storageConditions.trim()) errors.push(`Row ${rowIndex + 1}: "storageConditions" is required.`);
      if (!commercialConditions.trim()) errors.push(`Row ${rowIndex + 1}: "commercialConditions" is required.`);
      if (!["TRUE", "FALSE"].includes(isPerishable.trim().toUpperCase())) {
        errors.push(`Row ${rowIndex + 1}: "isPerishable" must be either TRUE or FALSE.`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  deleteFile() {
    this.jsonData = [];
    this.fileErrors = [];
    this.isFileUploaded = false;
  }
}
