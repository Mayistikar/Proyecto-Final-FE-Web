import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UploadProductComponent } from './upload-product.component';
import { ProductService } from '../services/product.service';

describe('UploadProductComponent', () => {
  let component: UploadProductComponent;
  let fixture: ComponentFixture<UploadProductComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['sendProducts']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    const activatedRouteSpy = { snapshot: { params: {} } }; // Mock ActivatedRoute

    await TestBed.configureTestingModule({
      imports: [UploadProductComponent], // Add the standalone component here
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }, // Provide mock ActivatedRoute
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadProductComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should clean the data when clean() is called', () => {
    component.jsonData = [{ name: 'Test' }];
    component.isFileUploaded = true;
    component.fileErrors = ['Error'];

    component.clean();

    expect(component.jsonData).toEqual([]);
    expect(component.isFileUploaded).toBeFalse();
    expect(component.fileErrors).toEqual([]);
  });

  it('should validate CSV structure correctly', () => {
    const validCsv = 'name;description;category;price;currency;stock;sku;expirationDate;deliveryTime;storageConditions;commercialConditions;isPerishable\n' +
                     'Product A;Description A;Category A;10.5;USD;100;SKU001;2023-12-31;5;Dry;FOB;TRUE';
    const invalidCsv = 'name;description;category;price\n' +
                       'Product A;Description A;Category A;10.5';

    const validResult = component['validateCsvStructure'](validCsv);
    const invalidResult = component['validateCsvStructure'](invalidCsv);

    expect(validResult.isValid).toBeTrue();
    expect(validResult.errors).toEqual([]);

    expect(invalidResult.isValid).toBeFalse();
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

});
