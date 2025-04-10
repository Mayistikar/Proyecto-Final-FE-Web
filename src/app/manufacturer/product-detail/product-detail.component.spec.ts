import { TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProductService } from '../services/product.service';

// Mock para ActivatedRoute con ID simulado
const activatedRouteMock = {
  snapshot: {
    paramMap: {
      get: (key: string) => '123'  // Devuelve un ID falso
    }
  }
};

// Mock de ProductService
class MockProductService {
  getProductById = () => of({
    id: '123',
    name: 'Producto Ficticio',
    description: 'Este es un producto de prueba'
  });
}

describe('ProductDetailComponent', () => {
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
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductDetailComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
