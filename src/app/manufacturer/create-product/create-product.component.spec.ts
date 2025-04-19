import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flush,
  waitForAsync,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  TranslateModule,
  TranslateLoader,
  TranslateFakeLoader,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { CreateProductComponent } from './create-product.component';
import { ProductService } from '../services/product.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import {
  MatSnackBarModule,
  MatSnackBar,
} from '@angular/material/snack-bar';
import { faker } from '@faker-js/faker';

// ───────────────────────────────────
//  Spies y Stubs
// ───────────────────────────────────
class MockAuthService {
  getCurrentManufacturer = () => ({ id: '123', companyName: 'Mock Co.' });
}
class MockProductService {
  createProduct = jasmine.createSpy();
}
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}
// 🔸 nuevo — mock de FileReader para tests de imagen
class MockFileReader {
  result: string | null = null;
  onload!: () => void;
  readAsDataURL(_file: File) {
    this.result = 'data:image/png;base64,TESTBASE64==';
    this.onload();
  }
}

describe('CreateProductComponent', () => {
  let component: CreateProductComponent;
  let fixture: ComponentFixture<CreateProductComponent>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let productService: MockProductService;
  let router: MockRouter;

  beforeEach(async () => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        CreateProductComponent,        
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [
        { provide: ProductService, useClass: MockProductService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
        TranslateService,
        TranslateStore,
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    (window as any).FileReader = MockFileReader;

    fixture = TestBed.createComponent(CreateProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    productService = TestBed.inject(ProductService) as unknown as MockProductService;
    router = TestBed.inject(Router) as unknown as MockRouter;

    spyOn(TestBed.inject(TranslateService), 'instant').and.callFake((key) => key);
  });

  afterEach(() => {
    snackBar.open.calls.reset();
    productService.createProduct.calls.reset();
    router.navigate.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and set validator on perishable change', () => {
    const expirationDateControl = component.productForm.get('expirationDate');
    component.productForm.get('perishable')?.setValue(true);
    expect(expirationDateControl?.validator).toBeTruthy();
  });

  it('should call createProduct on valid form submit', () => {
    component.productForm.patchValue({
      name: 'Test Product',
      description: 'This is a test product description',
      category: 'food',
      price: 50,
      imageUrl: 'https://example.com/image.jpg',
      stock: 100,
      sku: 'SKU123',
      expirationDate: '2025-12-12',
      deliveryTime: 3,
      storageConditions: 'Keep dry',
      commercialConditions: 'Standard',
      perishable: true,
    });
    productService.createProduct.and.returnValue(of({}));

    component.onSubmit();

    expect(productService.createProduct).toHaveBeenCalled();
  });

  it('should navigate on cancel', () => {
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['manufacturer-dashboard']);
  });

  it('should add/remove the required validator on expirationDate when toggling perishable', () => {
    const perishableControl = component.productForm.get('perishable');
    const expirationControl = component.productForm.get('expirationDate');

    perishableControl?.setValue(false);
    expirationControl?.updateValueAndValidity();
    expect(expirationControl?.validator).toBeNull();
    expect(expirationControl?.value).toBeNull();

    perishableControl?.setValue(true);
    expirationControl?.updateValueAndValidity();
    expect(expirationControl?.errors).toEqual({ required: true });

    perishableControl?.setValue(false);
    expirationControl?.updateValueAndValidity();
    expect(expirationControl?.validator).toBeNull();
    expect(expirationControl?.value).toBeNull();
  });

  it('should store file, set preview and patch imageUrl on onImageChange', () => {
    const mockFile = new File(['dummy'], 'my-image.png', { type: 'image/png' });
    const event = { target: { files: [mockFile] } } as unknown as Event;

    component.onImageChange(event);

    expect(component.selectedImageFile).toBe(mockFile);
    expect(component.imagePreview).toBe('data:image/png;base64,TESTBASE64==');
    expect(component.productForm.get('imageUrl')?.value).toBe('placeholder-url');
  });

  it('should early‑return when no file is provided in onImageChange', () => {
    component.selectedImageFile = null;
    component.imagePreview      = null;
    component.productForm.patchValue({ imageUrl: '' });
  
    const event = { target: { files: [] } } as unknown as Event;
  
    component.onImageChange(event);
  
    expect(component.selectedImageFile).toBeNull();
    expect(component.imagePreview).toBeNull();
    expect(component.productForm.get('imageUrl')?.value).toBe('');
   });

   it('should display FORM.INVALID snackbar and stop when form is invalid (alt approach)', () => {
    const openSpy = spyOn(component['snackBar'] as MatSnackBar, 'open');
  
    expect(component.productForm.invalid).toBeTrue();   
    component.onSubmit();
  
    expect(openSpy).toHaveBeenCalledTimes(1);
  
    const [msg, action, cfg] = openSpy.calls.mostRecent().args;
    expect(msg).toBe('FORM.INVALID');
    expect(action).toBe('OK');
    expect(cfg).toEqual(jasmine.objectContaining({ duration: 3000 }));
  
    expect(productService.createProduct).not.toHaveBeenCalled();
  });


  it('should display PRODUCT.CREATED_ERROR snackbar and reset loading when createProduct fails', fakeAsync(() => {
    component.productForm.setValue({
      name: 'Widget X',
      description: 'My awesome widget',
      category: 'gadgets',
      price: 99.99,
      imageUrl: 'https://img',
      stock: 5,
      sku: 'WX-001',
      expirationDate: null,
      deliveryTime: 3,
      storageConditions: 'Keep dry',
      commercialConditions: 'FOB',
      perishable: false,
    });
  
    productService.createProduct.and.returnValue(
      throwError(() => new Error('network down'))
    );
  
    const openSpy = spyOn(component['snackBar'] as MatSnackBar, 'open');
  
    component.onSubmit();
    tick();      
  
    expect(productService.createProduct).toHaveBeenCalledTimes(1);
  
    const [msg, action, cfg] = openSpy.calls.mostRecent().args;
    expect(msg).toBe('PRODUCT.CREATED_ERROR');
    expect(action).toBe('OK');
    expect(cfg).toEqual(jasmine.objectContaining({ duration: 3000 }));
  
    expect(component.loading).toBeFalse();
  
    flush();
  }));


});
