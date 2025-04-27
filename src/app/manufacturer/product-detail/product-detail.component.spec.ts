import { TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductService } from '../services/product.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';

const activatedRouteMock = {
  snapshot: {
    paramMap: {
      get: (key: string) => '123'
    }
  }
};

class MockProductService {
  getProductById = jasmine.createSpy().and.returnValue(of({
    id: '123',
    name: 'Producto Ficticio',
    description: 'Este es un producto de prueba',
    category: 'Bebidas',
    price: 9.99,
    currency: 'COP',
    stock: 100,
    sku: 'SKU123',
    expiration_date: '2025-12-31',
    delivery_time: 5,
    storage_conditions: 'Refrigerado',
    commercial_conditions: 'Pago contra entrega',
    is_perishable: true,
    image: 'https://example.com/image.jpg',
    manufacturer_id: 'manu123',
    warehouse: 'Bodega Central'
  }));
}

const routerMock = {
  navigate: jasmine.createSpy('navigate')
};

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: any;
  let productService: MockProductService;
  let toastrService: ToastrService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductDetailComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        TranslateService,
        TranslateStore,
        { provide: ProductService, useClass: MockProductService },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as unknown as MockProductService;
    toastrService = TestBed.inject(ToastrService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize productId and load product successfully', () => {
    spyOn(toastrService, 'success');
    component.ngOnInit();
    expect(component.productId).toBe('123');
    expect(productService.getProductById).toHaveBeenCalledWith('123');
    expect(component.product).toBeDefined();
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBeFalse();
    expect(toastrService.success).toHaveBeenCalled();
  });

  it('should handle product load error correctly when service throws error', () => {
    spyOn(toastrService, 'error');
    productService.getProductById = jasmine.createSpy().and.returnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBeTrue();
    expect(toastrService.error).toHaveBeenCalled();
  });

  it('should navigate to edit-product page when editProduct is called', () => {
    component.productId = '456';
    component.editProduct();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/manufacturer/edit-product/456']);
  });

  it('should navigate back to dashboard when cancel is called', () => {
    component.cancel();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/manufacturer-dashboard']);
  });

  // NUEVA PRUEBA para cubrir el if (!data)
  it('should handle load error when product data is empty', () => {
    spyOn(toastrService, 'error'); // Espiamos los toasts de error
    productService.getProductById = jasmine.createSpy().and.returnValue(of(null)); // Simulamos respuesta nula
    component.ngOnInit();
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBeTrue();
    expect(toastrService.error).toHaveBeenCalled(); // Debe mostrar un toast de error
  });
});
