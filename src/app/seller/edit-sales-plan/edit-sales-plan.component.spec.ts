/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EditSalesPlanComponent } from './edit-sales-plan.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { SalesPlanService } from '../services/sales-plan.service';
import { AuthService } from '../../auth/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class MockSalesPlanService {
  getById = jasmine.createSpy('getById');
  update = jasmine.createSpy('update');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockActivatedRoute {
  snapshot = { paramMap: { get: (key: string) => 'test-plan-id' } };
}

class MockAuthService {
  getUserId = () => 'seller-id-123';
  getUserData = () => ({ role: 'seller', zone: 'ZONE_BOGOTA' });
}

describe('EditSalesPlanComponent', () => {
  let component: EditSalesPlanComponent;
  let fixture: ComponentFixture<EditSalesPlanComponent>;
  let router: MockRouter;
  let salesPlanService: MockSalesPlanService;
  let toastrService: ToastrService;
  let translate: TranslateService;

  beforeEach(async () => {
    router = new MockRouter();
    salesPlanService = new MockSalesPlanService();

    await TestBed.configureTestingModule({
      imports: [
        EditSalesPlanComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } })
      ],
      providers: [
        TranslateService,
        TranslateStore,
        { provide: Router, useValue: router },
        { provide: SalesPlanService, useValue: salesPlanService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: ActivatedRoute, useClass: MockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditSalesPlanComponent);
    component = fixture.componentInstance;
    toastrService = TestBed.inject(ToastrService);
    translate = TestBed.inject(TranslateService);

    const mockPlan = {
      name: 'Edit Plan',
      description: 'Test description',
      visitRoute: 'ROUTE_BOGOTA_NORTE',
      dailyGoal: 5,
      weeklyGoal: 25,
      startTime: '08:00',
      endTime: '17:00',
      strategy: 'DIRECT_PROMOTION',
      event: 'LOCAL_CONCERT'
    };
    salesPlanService.getById.and.returnValue(of(mockPlan));
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should patch the form with loaded plan data', () => {
    expect(component.salesPlanForm.value.name).toBe('Edit Plan');
    expect(salesPlanService.getById).toHaveBeenCalledWith('test-plan-id');
  });

  it('should mark form touched and not submit if invalid', () => {
    component.salesPlanForm.controls['name'].setValue('');
    component.onSubmit();
    expect(component.salesPlanForm.touched).toBeTrue();
    expect(salesPlanService.update).not.toHaveBeenCalled();
  });

  it('should update and navigate on successful submission', fakeAsync(() => {
    spyOn(translate, 'get').and.returnValue(of('Éxito'));
    spyOn(toastrService, 'success');

    component.salesPlanForm.setValue({
      name: 'Updated Plan',
      description: 'Updated',
      visitRoute: 'ROUTE_BOGOTA_NORTE',
      dailyGoal: 10,
      weeklyGoal: 50,
      startTime: '09:00',
      endTime: '18:00',
      strategy: 'FREE_SAMPLES',
      event: 'SPORT_EVENT'
    });

    salesPlanService.update.and.returnValue(of({}));
    component.onSubmit();
    tick();

    expect(toastrService.success).toHaveBeenCalledWith('Éxito');
    expect(router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
    expect(component.isLoading).toBeFalse();
  }));

  it('should show toast on update error', fakeAsync(() => {
    spyOn(translate, 'get').and.returnValue(of('Error'));
    spyOn(toastrService, 'error');

    component.salesPlanForm.setValue({
      name: 'Fail',
      description: 'Test',
      visitRoute: 'ROUTE_BOGOTA_SUR',
      dailyGoal: 5,
      weeklyGoal: 25,
      startTime: '08:00',
      endTime: '17:00',
      strategy: 'BULK_DISCOUNT',
      event: 'REGIONAL_FAIR'
    });

    salesPlanService.update.and.returnValue(throwError(() => new Error('fail')));
    component.onSubmit();
    tick();

    expect(toastrService.error).toHaveBeenCalledWith('Error');
    expect(component.isLoading).toBeFalse();
  }));

  it('should set availableRoutes to [] if zone is unknown', () => {
    const mockUser = { role: 'seller', zone: 'ZONE_UNKNOWN' };
    spyOn(component['authService'], 'getUserData').and.returnValue({
      id: 'test-id',
      email: 'test@example.com',
      role: 'seller',
      zone: 'ZONE_UNKNOWN',
      idToken: 'mock-token',
      accessToken: 'mock-token',
      refreshToken: 'mock-token'
    });
    component.ngOnInit();
    expect(component.availableRoutes).toEqual([]);
  });

  it('should assign empty sellerId if authService.getUserId is null', () => {
    spyOn(component['authService'], 'getUserId').and.returnValue(null);
    component.planId = 'plan-001';

    component.salesPlanForm.setValue({
      name: 'Plan',
      description: '',
      visitRoute: 'ROUTE_BOGOTA_NORTE',
      dailyGoal: 5,
      weeklyGoal: 25,
      startTime: '08:00',
      endTime: '17:00',
      strategy: 'DIRECT_PROMOTION',
      event: 'LOCAL_CONCERT'
    });

    salesPlanService.update.and.returnValue(of({}));
    component.onSubmit();

    expect(salesPlanService.update).toHaveBeenCalledWith('plan-001', jasmine.objectContaining({ sellerId: '' }));
  });

  it('should navigate to detail page on cancel', () => {
    component.planId = 'plan-888';
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/seller/sales-plan-detail/plan-888']);
  });

  it('should navigate to /login if user is invalid', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'getUserData').and.returnValue(null);
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should show error and redirect if planId is missing', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'getUserData').and.returnValue({
      id: 'seller-id-001',
      email: 'seller@example.com',
      role: 'seller',
      zone: 'ZONE_BOGOTA',
      idToken: 'mock-idToken',
      accessToken: 'mock-accessToken',
      refreshToken: 'mock-refreshToken'
    });
    const route = TestBed.inject(ActivatedRoute);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue('');
    spyOn(toastrService, 'error');

    component.ngOnInit();

    expect(toastrService.error).toHaveBeenCalledWith('ID inválido del plan.');
    expect(router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  });

  it('should handle load error and navigate', fakeAsync(() => {
    spyOn(translate, 'get').and.returnValue(of('Error al cargar'));
    spyOn(toastrService, 'error');
    component.planId = 'plan-error';
    salesPlanService.getById.and.returnValue(throwError(() => new Error('fail')));
    component['loadSalesPlan']();
    tick();
    expect(toastrService.error).toHaveBeenCalledWith('Error al cargar');
    expect(router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  }));
});
