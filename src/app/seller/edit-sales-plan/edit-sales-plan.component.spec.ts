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
    spyOn(toastrService, 'success');
    component.salesPlanForm.setValue({
      name: 'Updated Plan',
      description: 'Updated description',
      visitRoute: 'ROUTE_BOGOTA_NORTE',
      dailyGoal: 10,
      weeklyGoal: 50,
      startTime: '09:00',
      endTime: '18:00',
      strategy: 'FREE_SAMPLES',
      event: 'SPORT_EVENT'
    });
    component.initialSalesPlanData = { ...component.salesPlanForm.value, description: 'Different description' }; // Forzar isFormChanged true

    salesPlanService.update.and.returnValue(of({}));
    component.onSubmit();
    tick(2000);

    expect(toastrService.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
    expect(component.updating).toBeFalse();
  }));

  it('should not submit if no changes detected', () => {
    spyOn(toastrService, 'info');
    component.salesPlanForm.setValue({
      name: 'Edit Plan',
      description: 'Test description',
      visitRoute: 'ROUTE_BOGOTA_NORTE',
      dailyGoal: 5,
      weeklyGoal: 25,
      startTime: '08:00',
      endTime: '17:00',
      strategy: 'DIRECT_PROMOTION',
      event: 'LOCAL_CONCERT'
    });
    component.initialSalesPlanData = { ...component.salesPlanForm.value };

    component.onSubmit();

    expect(toastrService.info).toHaveBeenCalled();
    expect(salesPlanService.update).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard on cancel', () => {
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  });

  it('should handle load error and navigate', fakeAsync(() => {
    spyOn(toastrService, 'error');
    salesPlanService.getById.and.returnValue(throwError(() => new Error('Load fail')));
    component.ngOnInit();
    tick();
    expect(toastrService.error).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  }));
});
