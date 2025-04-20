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

  it('should load the sales plan and patch form', () => {
    expect(component.salesPlanForm.value.name).toBe('Edit Plan');
    expect(salesPlanService.getById).toHaveBeenCalledWith('test-plan-id');
  });

  it('should mark form as touched and prevent submission if invalid', () => {
    component.salesPlanForm.controls['name'].setValue('');
    component.onSubmit();
    expect(component.salesPlanForm.touched).toBeTrue();
    expect(salesPlanService.update).not.toHaveBeenCalled();
  });

  it('should update sales plan and navigate on success', fakeAsync(() => {
    spyOn(translate, 'get').and.returnValue(of('Plan actualizado'));
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

    expect(salesPlanService.update).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
    expect(toastrService.success).toHaveBeenCalledWith('Plan actualizado');
  }));

  it('should show error toast on update failure', fakeAsync(() => {
    spyOn(translate, 'get').and.returnValue(of('Error al actualizar'));
    spyOn(toastrService, 'error');

    component.salesPlanForm.setValue({
      name: 'Fail Plan',
      description: 'Failed update',
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

    expect(toastrService.error).toHaveBeenCalledWith('Error al actualizar');
  }));

  it('should set availableRoutes to [] if user zone is not in routesByZone', () => {
    const mockUser = {
      id: 'seller-001',
      email: 'seller@example.com',
      role: 'seller',
      zone: 'ZONE_UNKNOWN',
      idToken: '',
      accessToken: '',
      refreshToken: ''
    };

    spyOn(component['authService'], 'getUserData').and.returnValue(mockUser);

    component.ngOnInit();

    expect(component['availableRoutes']).toEqual([]);
  });

  it('should set sellerId as empty string when authService.getUserId returns null', () => {
    spyOn(component['authService'], 'getUserId').and.returnValue(null);

    component['planId'] = 'plan-001';

    salesPlanService.update.and.returnValue(of({}));

    component.salesPlanForm.setValue({
      name: 'Plan X',
      description: '',
      visitRoute: 'ROUTE_BOGOTA_NORTE',
      dailyGoal: 5,
      weeklyGoal: 25,
      startTime: '08:00',
      endTime: '17:00',
      strategy: 'DIRECT_PROMOTION',
      event: 'LOCAL_CONCERT'
    });

    component.onSubmit();

    expect(salesPlanService.update).toHaveBeenCalledWith('plan-001', jasmine.objectContaining({
      sellerId: '',
      name: 'Plan X'
    }));
  });

  it('should navigate to seller dashboard on cancel', () => {
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  });

  it('should navigate to /login if user is missing or invalid', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'getUserData').and.returnValue(null);
  
    component.ngOnInit();
  
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to /seller-dashboard if planId is missing and show error', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'getUserData').and.returnValue({
      id: 'user-id-001',
      email: 'seller@example.com',
      role: 'seller',
      zone: 'ZONE_BOGOTA',
      idToken: 'dummy-id-token',
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token'
    });

    const route = TestBed.inject(ActivatedRoute);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue('');
  
    const toastr = TestBed.inject(ToastrService);
    spyOn(toastr, 'error');
  
    component.ngOnInit();
  
    expect(toastr.error).toHaveBeenCalledWith('ID inválido del plan.');
    expect(router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  });

  it('should show error toast and navigate if getById fails', fakeAsync(() => {
    spyOn(translate, 'get').and.returnValue(of('Error al cargar plan'));
    spyOn(toastrService, 'error');
  
    component['planId'] = 'plan-error-id';
  
    salesPlanService.getById.and.returnValue(throwError(() => new Error('backend error')));
  
    component['loadSalesPlan'](); 
    tick();
  
    expect(translate.get).toHaveBeenCalledWith('SALES_PLAN.LOAD_ERROR');
    expect(toastrService.error).toHaveBeenCalledWith('Error al cargar plan');
    expect(router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  }));


  
});