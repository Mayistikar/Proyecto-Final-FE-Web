/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SalesPlanDetailComponent } from './sales-plan-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService } from '@ngx-translate/core';
import { SalesPlanService } from '../services/sales-plan.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { SalesPlan } from '../../models/sales-plan.model';

describe('SalesPlanDetailComponent', () => {
  let component: SalesPlanDetailComponent;
  let fixture: ComponentFixture<SalesPlanDetailComponent>;
  let salesPlanServiceSpy: jasmine.SpyObj<SalesPlanService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastr: ToastrService;
  let translate: TranslateService;

  const mockApiResponse = {
    id: 'plan-123',
    name: 'Sample Plan',
    description: 'Plan description',
    visit_route: 'ROUTE_BOGOTA_NORTE',
    strategy: 'DIRECT_PROMOTION',
    event: 'LOCAL_CONCERT',
    daily_goal: 5,
    weekly_goal: 25,
    start_time: '08:00',
    end_time: '17:00',
    seller_id: 'seller-abc',
    created_at: '2024-04-25T12:00:00'
  };

  const expectedSalesPlan: SalesPlan = {
    id: 'plan-123',
    name: 'Sample Plan',
    description: 'Plan description',
    visitRoute: 'ROUTE_BOGOTA_NORTE',
    strategy: 'DIRECT_PROMOTION',
    event: 'LOCAL_CONCERT',
    dailyGoal: 5,
    weeklyGoal: 25,
    startTime: '08:00',
    endTime: '17:00',
    sellerId: 'seller-abc',
    createdAt: '2024-04-25T12:00:00'
  };

  beforeEach(async () => {
    salesPlanServiceSpy = jasmine.createSpyObj('SalesPlanService', ['getById']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        SalesPlanDetailComponent,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        { provide: SalesPlanService, useValue: salesPlanServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'plan-123' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesPlanDetailComponent);
    component = fixture.componentInstance;
    toastr = TestBed.inject(ToastrService);
    translate = TestBed.inject(TranslateService);

    // Mock de translate.instant para evitar errores de traducción en los toasts
    spyOn(translate, 'instant').and.callFake((key: string) => key);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load the sales plan successfully on init', fakeAsync(() => {
    spyOn(toastr, 'success');
    salesPlanServiceSpy.getById.and.returnValue(of(mockApiResponse as any));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(salesPlanServiceSpy.getById).toHaveBeenCalledWith('plan-123');
    expect(component.salesPlan).toEqual(expectedSalesPlan);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeFalse();
    expect(toastr.success).toHaveBeenCalled();
  }));

  it('should handle error if getById fails', fakeAsync(() => {
    spyOn(toastr, 'error');
    salesPlanServiceSpy.getById.and.returnValue(throwError(() => new Error('Not Found')));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.salesPlan).toBeUndefined();
    expect(component.loading).toBeFalse();
    expect(component.error).toBeTrue();
    expect(toastr.error).toHaveBeenCalled();
  }));

  it('should navigate to edit page on editPlan()', () => {
    component.salesPlan = { ...expectedSalesPlan };
    component.editPlan();
    expect(routerSpy.navigate).toHaveBeenCalledWith([`/seller/edit-sales-plan/${expectedSalesPlan.id}`]);
  });

  it('should navigate to dashboard on cancel', () => {
    component.onCancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  });

  it('should handle missing planId in route', fakeAsync(() => {
    spyOn(toastr, 'error');
    const activatedRoute = TestBed.inject(ActivatedRoute);
    spyOn(activatedRoute.snapshot.paramMap, 'get').and.returnValue(null);

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.error).toBeTrue();
    expect(component.loading).toBeFalse();
    expect(component.salesPlan).toBeUndefined();
    expect(toastr.error).toHaveBeenCalled();
  }));

  it('should handle null sales plan from API', fakeAsync(() => {
    spyOn(toastr, 'error');
    salesPlanServiceSpy.getById.and.returnValue(of(null as any));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.error).toBeTrue();
    expect(component.loading).toBeFalse();
    expect(toastr.error).toHaveBeenCalled();
  }));
});
