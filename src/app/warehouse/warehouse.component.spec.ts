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

  afterEach(() => {
    httpMock.verify();
  });
});
