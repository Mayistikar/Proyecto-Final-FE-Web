import { TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductService } from '../services/product.service';

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
    description: 'Este es un producto de prueba'
  }));
}

const routerMock = {
  navigate: jasmine.createSpy('navigate')
};

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: any;
  let productService: MockProductService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductDetailComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize productId from route and load product on ngOnInit', () => {
    component.ngOnInit();
    expect(component.productId).toBe('123');
    expect(productService.getProductById).toHaveBeenCalledWith('123');
    expect(component.product).toEqual(jasmine.objectContaining({ id: '123' }));
    expect(component.loading).toBeFalse();
  });

  it('should handle error in getProductById', () => {
    productService.getProductById = jasmine.createSpy().and.returnValue(throwError(() => new Error('error')));
    component.ngOnInit();
    expect(component.loading).toBeFalse();
  });

  it('should navigate to edit-product page when editProduct is called', () => {
    component.productId = '456';
    component.editProduct();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/manufacturer/edit-product/456']);
  });
});
