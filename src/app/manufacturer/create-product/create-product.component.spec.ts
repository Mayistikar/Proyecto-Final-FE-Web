import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { CreateProductComponent } from './create-product.component';
import { ProductService } from '../services/product.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';


// 🔹 Mock services
class MockAuthService {
  getCurrentManufacturer = () => ({ id: '123', companyName: 'Mock Co.' });
}
class MockProductService {
  createProduct = () => of({});
}
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}


describe('CreateProductComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateProductComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      providers: [
        TranslateService,
        TranslateStore,
        { provide: ProductService, useClass: MockProductService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CreateProductComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});