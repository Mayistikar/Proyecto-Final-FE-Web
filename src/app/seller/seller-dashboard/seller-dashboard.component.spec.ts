import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SellerDashboardComponent } from './seller-dashboard.component';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateFakeLoader } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { SalesPlanService } from '../services/sales-plan.service';
import { UserData } from '../../auth/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MOCK_SALES_PLAN } from '../mocks/mock-sales-plan';
import { ToastrModule } from 'ngx-toastr';

describe('SellerDashboardComponent', () => {
  let component: SellerDashboardComponent;
  let fixture: ComponentFixture<SellerDashboardComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let salesPlanServiceSpy: jasmine.SpyObj<SalesPlanService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockSeller: UserData = {
    id: 'seller-id-123',
    email: 'seller@example.com',
    role: 'seller',
    idToken: 'id-token',
    accessToken: 'access-token',
    refreshToken: 'refresh-token'
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserData']);
    salesPlanServiceSpy = jasmine.createSpyObj('SalesPlanService', ['getSalesPlansBySeller']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        SellerDashboardComponent,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        TranslateService,
        TranslateStore,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SalesPlanService, useValue: salesPlanServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SellerDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to root if user is not a seller', () => {
    authServiceSpy.getUserData.and.returnValue({
      id: 'admin-id',
      email: 'admin@example.com',
      role: 'admin',
      idToken: '',
      accessToken: '',
      refreshToken: ''
    });

    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should load sales plans if seller is authenticated', () => {
    authServiceSpy.getUserData.and.returnValue(mockSeller);
    salesPlanServiceSpy.getSalesPlansBySeller.and.returnValue(of([MOCK_SALES_PLAN]));

    component.ngOnInit();

    expect(component.salesPlans.length).toBe(1);
    expect(component.salesPlans[0].id).toBe(MOCK_SALES_PLAN.id);
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBeFalse();
  });

  it('should handle error when sales plans cannot be loaded', () => {
    authServiceSpy.getUserData.and.returnValue(mockSeller);
    salesPlanServiceSpy.getSalesPlansBySeller.and.returnValue(throwError(() => new Error('Network error')));

    component.ngOnInit();

    expect(component.salesPlans.length).toBe(0);
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBeTrue();
  });

  it('should navigate to root if no user is returned', () => {
    authServiceSpy.getUserData.and.returnValue(null);
    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to create sales plan page', () => {
    component.createSalesPlan();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/seller/sales-plans/create']);
  });

  it('should navigate to sales plan detail page', () => {
    const planId = 'plan-123';
    component.viewSalesPlanDetail(planId);
    expect(routerSpy.navigate).toHaveBeenCalledWith([`/seller/sales-plan-detail/${planId}`]);
  });
});
