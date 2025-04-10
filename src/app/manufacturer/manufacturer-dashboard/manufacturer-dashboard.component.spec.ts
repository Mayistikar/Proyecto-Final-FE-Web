import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManufacturerDashboardComponent } from './manufacturer-dashboard.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductService } from '../services/product.service';
import { AuthService } from '../../auth/auth.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

const mockManufacturer = {
  id: '123',
  email: 'mock@domain.com',
  role: 'manufacturer',
  companyName: 'MockCompany'
};

const mockProducts = [
  { id: '1', name: 'PRODUCT_1_NAME', description: 'PRODUCT_1_DESC' },
  { id: '2', name: 'PRODUCT_2_NAME', description: 'PRODUCT_2_DESC' },
  { id: '3', name: 'PRODUCT_3_NAME', description: 'PRODUCT_3_DESC' }
];

class MockAuthService {
  getCurrentManufacturer() {
    return mockManufacturer;
  }
}

class MockProductService {
  getProductsByManufacturer() {
    return of(mockProducts);
  }
}

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: (key: string) => '123'
    }
  }
};

describe('ManufacturerDashboardComponent', () => {
  let component: ManufacturerDashboardComponent;
  let fixture: ComponentFixture<ManufacturerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ManufacturerDashboardComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: ProductService, useClass: MockProductService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        TranslateService,
        TranslateStore
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManufacturerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a manufacturer name defined', () => {
    expect(component.manufacturerName).toBe('MockCompany');
  });

  it('should contain 3 products initially', () => {
    expect(component.products.length).toBe(3);
  });

  it('should contain specific product keys', () => {
    expect(component.products[0].name).toBe('PRODUCT_1_NAME');
    expect(component.products[1].description).toBe('PRODUCT_2_DESC');
  });
});
