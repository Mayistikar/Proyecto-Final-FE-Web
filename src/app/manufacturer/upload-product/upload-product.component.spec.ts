import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { UploadProductComponent } from './upload-product.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../services/product.service';
import { AuthService, UserData } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';


describe('UploadProductComponent', () => {
  let component: UploadProductComponent;
  let fixture: ComponentFixture<UploadProductComponent>;
  let router: jasmine.SpyObj<Router>;

  const mockProduct: Product = new Product(
    '1',
    'Product 1',
    'Description',
    'Category',
    100,
    'http://example.com/image.jpg',
    50,
    'SKU123',
    '2025-12-31',
    5,
    'Keep cool',
    'Terms',
    true,
    'COP',
    'WH-001',
    '123'
  );

  const mockProductService = {
    getWarehouses: jasmine.createSpy().and.returnValue(of([
      { id: 'WH-001', name: 'Warehouse 1', country: 'CO', location: 'Bogotá', description: 'Main warehouse' }
    ])),
    sendProducts: jasmine.createSpy().and.returnValue(of([{ success: true }])),
    getProductsByManufacturer: jasmine.createSpy().and.returnValue(of([mockProduct]))
  };

  const mockAuthService = {
    getUserCountry: () => 'COVERAGE_CO',
    getUserId: () => '123',
    isAuthenticated: of(true),
    getUserData: (): UserData => ({
      id: '123',
      email: 'test@example.com',
      role: 'manufacturer',
      idToken: 'id-token',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      zone: 'ZONE_BOGOTA'
    }),
    getCurrentManufacturer: () => ({
      id: '123',
      email: 'test@example.com',
      role: 'manufacturer',
      companyName: 'TestCo'
    })
  };

  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  const mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);


  const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
  

  beforeEach(async () => {

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        UploadProductComponent,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        TranslateService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    mockProductService.getWarehouses.and.returnValue(of([
      { id: 'WH-001', name: 'Warehouse 1', country: 'CO', location: 'Bogotá', description: 'Main warehouse' }
    ]));
  
    fixture = TestBed.createComponent(UploadProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load warehouses', () => {
    expect(component.userId).toBe('123');
    expect(component.userCountry).toBe('CO');
    expect(mockProductService.getWarehouses).toHaveBeenCalled();
    expect(component.warehouses.length).toBeGreaterThan(0);
  });

  it('should clean file data', () => {
    component.jsonData = [mockProduct];
    component.fileErrors = ['error'];
    component.isFileUploaded = true;

    component.clean();

    expect(component.jsonData).toEqual([]);
    expect(component.fileErrors).toEqual([]);
    expect(component.isFileUploaded).toBeFalse();
  });

  it('should delete file and reset states', () => {
    component.jsonData = [mockProduct];
    component.isFileUploaded = true;
    component.fileErrors = ['error'];

    component.deleteFile();

    expect(component.jsonData).toEqual([]);
    expect(component.fileErrors.length).toBe(0);
    expect(component.isFileUploaded).toBeFalse();
  });

  it('should show alert if jsonData is empty', () => {
    spyOn(window, 'alert');
    component.jsonData = [];

    component.uploadProducts();

    expect(window.alert).toHaveBeenCalledWith('No products to upload.');
  });

  it('should convert CSV to JSON correctly', () => {
    const csv = 'name;description;category;price;currency;is_perishable;stock;sku;expiration_date;delivery_time;storage_conditions;image;commercial_conditions\n' +
      'Test;Desc;Cat;100;COP;TRUE;20;SKU001;2025-12-01;2;Cool;img.jpg;Conditions';
    const result = component['csvToJson'](csv);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Test');
  });

  it('should validate invalid CSV structure', () => {
    const invalidCsv = 'wrong;headers\nbad;data';
    const validation = component['validateCsvStructure'](invalidCsv);
    expect(validation.isValid).toBeFalse();
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('should log error when getWarehouses fails (userCountry defined)', () => {
    component.userCountry = 'CO';
    const consoleErrorSpy = spyOn(console, 'error');

    mockProductService.getWarehouses.and.returnValue(
      throwError(() => new Error('Test Error'))
    );

    component['loadWarehouses']();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading all warehouses:', jasmine.any(Error));
  });

  it('should log fallback error when getWarehouses fails (userCountry undefined)', () => {
    component.userCountry = undefined;
    const consoleErrorSpy = spyOn(console, 'error');

    mockProductService.getWarehouses.and.returnValue(
      throwError(() => new Error('Fallback Error'))
    );

    component['loadWarehouses']();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Fallback: Error loading all warehouses:', jasmine.any(Error));
  });

  it('should trigger file download with correct href and filename', () => {
    const clickSpy = jasmine.createSpy('click');
    const mockLink = {
      href: '',
      download: '',
      click: clickSpy
    };
  
    spyOn(document, 'createElement').and.returnValue(mockLink as any);
  
    component['downloadFile']();
  
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLink.href).toBe('https://assetsccp.s3.us-east-1.amazonaws.com/plantilla_2.0.csv');
    expect(mockLink.download).toBe('sample-file.pdf');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should process and upload a valid CSV file', () => {
    const fakeCsv = 'name;description\nTest;Example';
    const fakeFile = new Blob([fakeCsv], { type: 'text/csv' });
    const fakeInput = {
      files: [fakeFile]
    };
  
    const mockEvent = {
      target: fakeInput
    } as unknown as Event;
  
    const mockReader = {
      readAsText: jasmine.createSpy(),
      onload: Function.prototype,
      onerror: Function.prototype,
      result: fakeCsv
    };
  
    spyOn(window as any, 'FileReader').and.returnValue(mockReader);
  
    spyOn(component as any, 'validateCsvStructure').and.returnValue({ isValid: true, errors: [] });
    spyOn(component as any, 'csvToJson').and.returnValue([{ name: 'Test', description: 'Example' }]);
  
    component.uploadFile(mockEvent);
  
    mockReader.onload({ target: { result: fakeCsv } });
  
    expect(component['validateCsvStructure']).toHaveBeenCalledWith(fakeCsv);
    expect(component['csvToJson']).toHaveBeenCalledWith(fakeCsv);
    expect(component.jsonData.length).toBe(1);
    expect(component.isFileUploaded).toBeTrue();
  });

  it('should load warehouses when userCountry is undefined (fallback)', () => {
    component.userCountry = undefined;
    const mockWarehouses = [
      { id: 'WH-002', name: 'Fallback Warehouse', country: 'PE', location: 'Lima', description: 'Backup warehouse' }
    ];
  
    mockProductService.getWarehouses.and.returnValue(of(mockWarehouses));
  
    component['loadWarehouses'](); 
  
    expect(mockProductService.getWarehouses).toHaveBeenCalled();
    expect(component.warehouses).toEqual(mockWarehouses);
  });

  it('should set fileErrors if CSV validation fails', () => {
    const fakeCsv = 'invalid;csv';
    const fakeFile = new Blob([fakeCsv], { type: 'text/csv' });
  
    const event = {
      target: { files: [fakeFile] }
    } as unknown as Event;
  
    const mockReader = {
      readAsText: jasmine.createSpy(),
      onload: Function.prototype,
      onerror: Function.prototype,
      result: fakeCsv
    };
  
    spyOn(window as any, 'FileReader').and.returnValue(mockReader);
    spyOn(component as any, 'validateCsvStructure').and.returnValue({ isValid: false, errors: ['invalid format'] });
    spyOn(component as any, 'csvToJson').and.returnValue([]);
  
    component.uploadFile(event);
    mockReader.onload({ target: { result: fakeCsv } });
  
    expect(component.fileErrors).toEqual(['invalid format']);
  });

  it('should log error if file reading fails', () => {
    const fakeFile = new Blob(['content'], { type: 'text/csv' });
    const event = {
      target: { files: [fakeFile] }
    } as unknown as Event;
  
    const mockReader = {
      readAsText: jasmine.createSpy(),
      onload: Function.prototype,
      onerror: Function.prototype,
      result: ''
    };
  
    spyOn(window as any, 'FileReader').and.returnValue(mockReader);
    const consoleErrorSpy = spyOn(console, 'error');
  
    component.uploadFile(event);
    mockReader.onerror('Read error');
  
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error reading file:', 'Read error');
  });

  it('should log error if no file is selected', () => {
    const event = {
      target: { files: [] }
    } as unknown as Event;
  
    const consoleErrorSpy = spyOn(console, 'error');
  
    component.uploadFile(event);
  
    expect(consoleErrorSpy).toHaveBeenCalledWith('No file selected');
  });

  it('should show error snackbar if warehouseSelected is undefined and return early', () => {
    component.warehouseSelected = undefined as any;
    component.jsonData = [
      {
        name: 'Test Product',
        description: 'Test Desc',
        category: 'Test',
        price: 10,
        stock: 100,
        sku: 'TESTSKU',
        imageUrl: 'http://test.img',
        expirationDate: '2025-12-31',
        deliveryTime: 2,
        storageConditions: 'Cool place',
        commercialConditions: 'Test conditions'
      }
    ];
  
    const translateSpy = spyOn(component['translate'], 'instant').and.callFake((key: string) => {
      return key === 'SELECT_WAREHOUSE' ? 'Select warehouse first' : key;
    });
    const snackSpy = spyOn(component['snackBar'], 'open');

    component.uploadProducts();
  
    expect(translateSpy).toHaveBeenCalledWith('SELECT_WAREHOUSE');
    expect(snackSpy).toHaveBeenCalledWith('Select warehouse first', 'OK', {
      duration: 3000,
      panelClass: 'snackbar-error'
    });
  });
  

  it('should handle error on sendProducts and push translated error message', fakeAsync(() => {
    component.uploadErrors = [];
    component.isUploading = true;
    component.jsonData = [{ name: 'Producto 1' }];
  
    mockProductService.sendProducts.calls.reset();
    mockProductService.sendProducts.and.returnValue(
      throwError(() => new Error('Backend error'))
    );
  
    spyOn(component['translate'], 'instant').and.callFake((key: string) => {
      return key === 'FILE_UPLOAD_SUCCESS' ? 'Error al subir archivo' : key;
    });
  
    component.uploadProducts();
    tick();
  
    expect(component.uploadErrors.length).toBe(1);
    expect(component.uploadErrors[0]).toBe('Error al subir archivo');
    expect(component.isUploading).toBeFalse();
  }));

  describe('validateCsvStructure coverage', () => {
    it('should fail if CSV is empty', () => {
      const csv = ''; 
      const result = (component as any).validateCsvStructure(csv);
      expect(result.isValid).toBeFalse();
      expect(result.errors).toContain('CSV file is empty or has no data.');
    });
  
    it('should fail if CSV has only header line', () => {
      const csv = 'name;description;category'; // sin data
      const result = (component as any).validateCsvStructure(csv);
      expect(result.isValid).toBeFalse();
      expect(result.errors).toContain('CSV file is empty or has no data.');
    });
  
    it('should fail if CSV headers are in wrong order', () => {
      const csv = 'category;description;name\nFood;Good;Pizza'; // headers incorrectos
      const result = (component as any).validateCsvStructure(csv);
      expect(result.isValid).toBeFalse();
      expect(result.errors[0]).toContain('Expected Headers');
    });
  
    it('should fail if CSV headers have wrong names', () => {
      const csv = 'wrong1;wrong2;wrong3\nA;B;C';
      const result = (component as any).validateCsvStructure(csv);
      expect(result.isValid).toBeFalse();
      expect(result.errors[0]).toContain('Expected Headers');
    });
  
    it('should pass if CSV is valid with correct headers and data', () => {
      const validCsv = 'name;description;category;price;currency;is_perishable;stock;sku;expiration_date;delivery_time;storage_conditions;image;commercial_conditions\n' +
                       'Test;Nice;Food;100;COP;TRUE;10;SKU001;2025-12-01;3;Cool;img.jpg;Terms';
      const result = (component as any).validateCsvStructure(validCsv);
      expect(result.isValid).toBeTrue();
      expect(result.errors.length).toBe(0);
    });
  });
  

  it('should catch row with incorrect number of columns and return appropriate error', () => {
    const csv = 'name;description;category;price;currency;is_perishable;stock;sku;expiration_date;delivery_time;storage_conditions;image;commercial_conditions\n' +
                'Product A;Short Description;Cat 1;100;COP;TRUE;50;SKU001'; 
  
    (component as any).expectedHeaders = [
      'name', 'description', 'category', 'price', 'currency',
      'is_perishable', 'stock', 'sku', 'expiration_date',
      'delivery_time', 'storage_conditions', 'image', 'commercial_conditions'
    ];
  
    const result = (component as any).validateCsvStructure(csv);
  
    expect(result.isValid).toBeFalse();
    expect(result.errors).toEqual([
      'Row 2: Incorrect number of columns.'
    ]);
  });

  it('should pass full validation with all required fields correctly formatted', () => {
    const validCsv =
      'name;description;category;price;currency;is_perishable;stock;sku;expiration_date;delivery_time;storage_conditions;image;commercial_conditions\n' +
      'Pan;Delicious bread;Bakery;2500;COP;TRUE;50;SKU123;2025-12-31;3;Cool and dry;http://image.jpg;Terms and conditions apply';
  
    (component as any).expectedHeaders = [
      'name', 'description', 'category', 'price', 'currency',
      'is_perishable', 'stock', 'sku', 'expiration_date',
      'delivery_time', 'storage_conditions', 'image', 'commercial_conditions'
    ];
  
    const result = (component as any).validateCsvStructure(validCsv);
  
    expect(result.isValid).toBeTrue();
    expect(result.errors).toEqual([]);
  });

  it('should return all validation errors when CSV row has invalid or empty values', () => {
    const invalidCsv =
      'name;description;category;price;currency;is_perishable;stock;sku;expiration_date;delivery_time;storage_conditions;image;commercial_conditions\n' +
      ' ; ; ;abc; ;maybe;NaN; ;invalid-date;NaN; ; ; ';
  
    (component as any).expectedHeaders = [
      'name', 'description', 'category', 'price', 'currency',
      'is_perishable', 'stock', 'sku', 'expiration_date',
      'delivery_time', 'storage_conditions', 'image', 'commercial_conditions'
    ];
  
    const result = (component as any).validateCsvStructure(invalidCsv);
  
    expect(result.isValid).toBeFalse();
    expect(result.errors).toEqual([
      'Row 1: "name" is required.',
      'Row 1: "description" is required.',
      'Row 1: "category" is required.',
      'Row 1: "price" must be a valid number.',
      'Row 1: "currency" is required.',
      'Row 1: "stock" must be a valid integer.',
      'Row 1: "sku" is required.',
      'Row 1: "expiration_date" must be a valid date.',
      'Row 1: "delivery_time" must be a valid integer.',
      'Row 1: "storage_conditions" is required.',
      'Row 1: "commercial_conditions" is required.',
      'Row 1: "is_perishable" must be either TRUE or FALSE.'
    ]);
  });


  it('should set isUploading to false, call clean(), and navigate after successful upload', fakeAsync(() => {
    component.warehouseSelected = { id: 'WH-001' } as any;
    component.jsonData = [mockProduct];
  
    const cleanSpy = spyOn(component, 'clean');
    const translateSpy = spyOn(component['translate'], 'instant').and.callFake((key: string) => key);
  
    mockProductService.sendProducts.and.returnValue(of([{ success: true }]));
  
    component.uploadProducts();
    tick();
  
    expect(component.isUploading).toBeFalse();
    expect(cleanSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['manufacturer-dashboard']);
  }));
  

  
});
