import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WarehouseComponent } from './warehouse.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {TranslateService, TranslateStore, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { of } from 'rxjs';

class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

describe('WarehouseComponent', () => {
  let component: WarehouseComponent;
  let fixture: any;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WarehouseComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        CurrencyPipe,
        DatePipe,
        TranslateService,
        TranslateStore,
        { provide: TranslateLoader, useClass: MockTranslateLoader }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WarehouseComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch products and assign them to the products array', () => {
    const mockProducts = [
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' }
    ];

    component.fetchProducts();

    const req = httpMock.expectOne('https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api/products/search');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);

    expect(component.products).toEqual(mockProducts);
  });

  it('should filter products by search term, country, and warehouse', () => {
      component.products = [
        { name: 'Product A', sku: '123', category: 'Electronics', country: 'Colombia', warehouse: '1' },
        { name: 'Product B', sku: '456', category: 'Clothing', country: 'Estados Unidos', warehouse: '2' }
      ];
      component.searchTerm = 'Product A';
      component.selectedCountry = 'Colombia';
      component.selectedWarehouse = '1';

      const filteredProducts = component.filteredProducts;

      expect(filteredProducts.length).toBe(1);
      expect(filteredProducts[0].name).toBe('Product A');
    });

    it('should return all products when no filters are applied', () => {
      component.products = [
        { name: 'Product A', sku: '123', category: 'Electronics', country: 'Colombia', warehouse: '1' },
        { name: 'Product B', sku: '456', category: 'Clothing', country: 'Estados Unidos', warehouse: '2' }
      ];
      component.searchTerm = '';
      component.selectedCountry = '';
      component.selectedWarehouse = '';

      const filteredProducts = component.filteredProducts;

      expect(filteredProducts.length).toBe(2);
    });

    it('should return "Unknown Warehouse" for invalid warehouse ID', () => {
      component.warehouses = { '1': { name: 'Warehouse 1' } };

      const warehouseName = component.getWarehouseName('invalid-id');

      expect(warehouseName).toBe('Unknown Warehouse');
    });

    it('should fetch warehouses and map them by ID', () => {
      const mockWarehouses = [
        { id: '1', name: 'Warehouse 1' },
        { id: '2', name: 'Warehouse 2' }
      ];

      component.fetchWarehouses();

      const req = httpMock.expectOne('https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api/warehouses');
      req.flush(mockWarehouses);

      expect(component.warehouses).toEqual({
        '1': { id: '1', name: 'Warehouse 1' },
        '2': { id: '2', name: 'Warehouse 2' }
      });
    });

    it('should handle error when fetching warehouses', () => {
      spyOn(console, 'error');

      component.fetchWarehouses();

      const req = httpMock.expectOne('https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api/warehouses');
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

      expect(console.error).toHaveBeenCalledWith('Error fetching warehouses:', jasmine.anything());
    });
  afterEach(() => {
    httpMock.verify();
  });

  it('should call fetchProducts and fetchWarehouses on ngOnInit', () => {
    const fetchProductsSpy = spyOn(component, 'fetchProducts');
    const fetchWarehousesSpy = spyOn(component, 'fetchWarehouses');
  
    component.ngOnInit();
  
    expect(fetchProductsSpy).toHaveBeenCalled();
    expect(fetchWarehousesSpy).toHaveBeenCalled();
  });

  it('should handle error when fetching products', () => {
    spyOn(console, 'error');
  
    component.fetchProducts();
  
    const req = httpMock.expectOne('https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api/products/search');
    req.flush('Error loading products', { status: 500, statusText: 'Internal Server Error' });
  
    expect(console.error).toHaveBeenCalledWith('Error fetching products:', jasmine.anything());
    expect(component.isLoading).toBeFalse();
  });

  it('should set userName from localStorage if user_email exists', () => {
    const testEmail = 'test@example.com';
    spyOn(localStorage, 'getItem').withArgs('user_email').and.returnValue(testEmail);
  
    const fixture = TestBed.createComponent(WarehouseComponent);
    const component = fixture.componentInstance;
  
    expect(component.userName).toBe(testEmail);
  });

  it('should set userName to empty string if user_email is falsy', () => {
    spyOn(localStorage, 'getItem').withArgs('user_email').and.returnValue('');
  
    const fixture = TestBed.createComponent(WarehouseComponent);
    const component = fixture.componentInstance;
  
    expect(component.userName).toBe('');
  });

  it('should assign empty string to userName if user_email is null', () => {
    spyOn(localStorage, 'getItem').withArgs('user_email').and.returnValue(null);
  
    const fixture = TestBed.createComponent(WarehouseComponent);
    const component = fixture.componentInstance;
  
    expect(component.userName).toBe('');
  });
  
});
