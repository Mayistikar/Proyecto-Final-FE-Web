import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { CreateProductComponent } from './create-product.component';
import { ProductService } from '../services/product.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MatSnackBar } from '@angular/material/snack-bar';

class MockAuthService {
  getUserId() {
    return '123';
  }
}

class MockProductService {
  createProduct = jasmine.createSpy();
  getWarehouses = jasmine.createSpy();
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('CreateProductComponent', () => {
  let component: CreateProductComponent;
  let fixture: ComponentFixture<CreateProductComponent>;
  let productService: MockProductService;
  let router: MockRouter;
  let toastrService: jasmine.SpyObj<ToastrService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    toastrService = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        CreateProductComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [
        { provide: ProductService, useClass: MockProductService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
        { provide: ToastrService, useValue: toastrService },
        { provide: MatSnackBar, useValue: snackBar },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProductComponent);
    component = fixture.componentInstance;

    productService = TestBed.inject(ProductService) as unknown as MockProductService;
    router = TestBed.inject(Router) as unknown as MockRouter;

    spyOn(TestBed.inject(TranslateService), 'instant').and.callFake((key) => key);

    productService.getWarehouses.and.returnValue(of([]));

    fixture.detectChanges();
  });

  afterEach(() => {
    toastrService.success.calls.reset();
    toastrService.error.calls.reset();
    snackBar.open.calls.reset();
    router.navigate.calls.reset();
    productService.createProduct.calls.reset();
    productService.getWarehouses.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and set validator on perishable change', () => {
    const expirationDateControl = component.productForm.get('expirationDate');
    component.productForm.get('perishable')?.setValue(true);
    expect(expirationDateControl?.validator).toBeTruthy();
  });

  it('should mark all fields touched and show error if form invalid', () => {
    spyOn(component, 'markAllFieldsAsTouched').and.callThrough();
    component.onSubmit();
    expect(component.markAllFieldsAsTouched).toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith('FORM.INVALID', 'COMMON.ERROR', { timeOut: 3000 });
    expect(productService.createProduct).not.toHaveBeenCalled();
  });

  it('should submit form, show success toast and navigate after delay', fakeAsync(() => {
    component.productForm.patchValue({
      name: 'Test Product',
      description: 'This is a test product',
      category: 'Electronics',
      price: 100,
      stock: 10,
      sku: 'SKU12345',
      expirationDate: null,
      deliveryTime: 5,
      storageConditions: 'Store in cool place',
      commercialConditions: 'FOB',
      perishable: false,
      currency: 'USD',
      warehouse: 'warehouse1',
      country: 'Colombia',
      imageUrl: 'image.jpg'
    });

    productService.createProduct.and.returnValue(of({}));

    component.onSubmit();
    tick(2000);

    expect(productService.createProduct).toHaveBeenCalledTimes(1);
    expect(toastrService.success).toHaveBeenCalledWith('PRODUCT_CREATED_SUCCESS', 'COMMON.SUCCESS', { timeOut: 3000 });
    expect(router.navigate).toHaveBeenCalledWith(['manufacturer-dashboard']);
    flush();
  }));

  it('should show error toast and not navigate if creation fails', fakeAsync(() => {
    component.productForm.patchValue({
      name: 'Fail Product',
      description: 'Fail description',
      category: 'Food',
      price: 10,
      stock: 5,
      sku: 'SKUFAIL',
      expirationDate: null,
      deliveryTime: 2,
      storageConditions: 'Dry place',
      commercialConditions: 'CIF',
      perishable: false,
      currency: 'COP',
      warehouse: 'warehouse2',
      country: 'Colombia',
      imageUrl: 'fail.jpg'
    });

    productService.createProduct.and.returnValue(throwError(() => new Error('Server error')));

    component.onSubmit();
    tick();

    expect(productService.createProduct).toHaveBeenCalledTimes(1);
    expect(toastrService.error).toHaveBeenCalledWith('PRODUCT_CREATED_ERROR', 'COMMON.ERROR', { timeOut: 3000 });
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    flush();
  }));

  it('should navigate back when cancel is clicked', () => {
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['manufacturer-dashboard']);
  });

  it('should do nothing if no file selected', () => {
    component.selectedImageFile = null;
    component.imagePreview = null;
    component.productForm.patchValue({ imageUrl: '' });

    const event = { target: { files: [] } } as unknown as Event;
    component.onImageChange(event);

    expect(component.selectedImageFile).toBeNull();
    expect(component.imagePreview).toBeNull();
    expect(component.productForm.get('imageUrl')?.value).toBe('');
  });

  it('should process image upload correctly and patch form with file name', fakeAsync(() => {
    const mockFile = new File(['dummy content'], 'test-image.png', { type: 'image/png' });

    const event = {
      target: {
        files: [mockFile]
      }
    } as unknown as Event;

    const fileReaderMock = {
      result: 'data:image/png;base64,MOCKBASE64==',
      onload: undefined as (() => void) | undefined,
      readAsDataURL: jasmine.createSpy('readAsDataURL').and.callFake(() => {
        fileReaderMock.onload?.();
      })
    };
    
    spyOn(window as any, 'FileReader').and.returnValue(fileReaderMock);

    component.onImageChange(event);
    tick();

    expect(component.selectedImageFile).toBe(mockFile);
    expect(component.imagePreview).toBe('data:image/png;base64,MOCKBASE64==');
    expect(component.productForm.get('imageUrl')?.value).toBe('test-image.png');
    flush();
  }));

  it('should set invalidDate error if expiration date is before today', fakeAsync(() => {
    const expirationControl = component.productForm.get('expirationDate');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Ayer

    expirationControl?.setValue(pastDate);
    fixture.detectChanges();
    tick();

    expect(expirationControl?.errors).toEqual({ invalidDate: true });
    flush();
  }));

  it('should show error toast if getWarehouses fails', fakeAsync(() => {
    (productService.getWarehouses as jasmine.Spy).and.returnValue(throwError(() => new Error('Warehouse error')));
  
    fixture = TestBed.createComponent(CreateProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
  
    expect(toastrService.error).toHaveBeenCalledWith(
      'WAREHOUSE.LOAD_ERROR',
      'COMMON.ERROR',
      { timeOut: 3000 }
    );
  
    flush();
  }));
  
});


