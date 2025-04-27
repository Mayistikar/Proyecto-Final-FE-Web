/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SalesPlanDetailComponent } from './sales-plan-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { SalesPlanService } from '../services/sales-plan.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SalesPlan } from '../../models/sales-plan.model';
import { ToastrModule } from 'ngx-toastr';

describe('SalesPlanDetailComponent', () => {
  let component: SalesPlanDetailComponent;
  let fixture: ComponentFixture<SalesPlanDetailComponent>;
  let salesPlanServiceSpy: jasmine.SpyObj<SalesPlanService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPlan: SalesPlan = {
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
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load the sales plan successfully on init', fakeAsync(() => {
    salesPlanServiceSpy.getById.and.returnValue(of(mockPlan));

    component.ngOnInit();
    fixture.detectChanges();
    tick();

    expect(salesPlanServiceSpy.getById).toHaveBeenCalledWith('plan-123');
    expect(component.salesPlan).toEqual(mockPlan);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeFalse();
  }));

  it('should handle error if getById fails', fakeAsync(() => {
    salesPlanServiceSpy.getById.and.returnValue(throwError(() => new Error('Not Found')));

    component.ngOnInit();
    fixture.detectChanges();
    tick();

    expect(component.salesPlan).toBeUndefined();
    expect(component.loading).toBeFalse();
    expect(component.error).toBeTrue();
  }));

  it('should navigate to edit page on editPlan()', () => {
    component.salesPlan = { ...mockPlan };
    component.editPlan();

    expect(routerSpy.navigate).toHaveBeenCalledWith([`/seller/edit-sales-plan/${mockPlan.id}`]);
  });

  it('should navigate to dashboard on cancel', () => {
    component.onCancel();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  });

  it('should handle missing planId in route', () => {
    const activatedRoute = TestBed.inject(ActivatedRoute);
    spyOn(activatedRoute.snapshot.paramMap, 'get').and.returnValue(null);

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.error).toBeTrue();
    expect(component.loading).toBeFalse();
    expect(component.salesPlan).toBeUndefined();
  });
});
