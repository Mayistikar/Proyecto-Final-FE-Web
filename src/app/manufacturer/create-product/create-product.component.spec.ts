import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { CreateProductComponent } from './create-product.component';
import { ProductService } from '../services/product.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// 🔹 Mock services
class MockAuthService {
  getCurrentManufacturer = () => ({ id: '123', companyName: 'Mock Co.' });
}

class MockProductService {
  createProduct = jasmine.createSpy().and.returnValue(of({}));
  getPresignedUrl = jasmine.createSpy().and.returnValue(of({ uploadUrl: 'url', publicUrl: 'public-url' }));
  uploadToS3 = jasmine.createSpy().and.returnValue(of({}));
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('CreateProductComponent', () => {
  let component: CreateProductComponent;
  let fixture: ComponentFixture<CreateProductComponent>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        CreateProductComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        TranslateService,
        TranslateStore,
        { provide: ProductService, useClass: MockProductService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(TestBed.inject(TranslateService), 'instant').and.callFake((key) => key);
  });

  afterEach(() => {
    snackBar.open.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and set validator on perishable change', () => {
    const expirationDateControl = component.productForm.get('expirationDate');
    component.productForm.get('perishable')?.setValue(true);
    expect(expirationDateControl?.validator).toBeTruthy();
  });


  it('should submit form and navigate on success', () => {
    const router = TestBed.inject(Router);
    component.productForm.patchValue({
      name: 'Product 1',
      description: 'Description for product',
      category: 'food',
      price: 10,
      imageUrl: 'image-url',
      stock: 100,
      sku: 'SKU-001',
      expirationDate: '2025-12-12',
      deliveryTime: 3,
      storageConditions: 'cool and dry',
      commercialConditions: 'standard',
      perishable: true
    });
    component.onSubmit();
    expect(router.navigate).toHaveBeenCalledWith(['manufacturer-dashboard']);
  });

  it('should navigate on cancel', () => {
    const router = TestBed.inject(Router);
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['manufacturer-dashboard']);
  });
});
