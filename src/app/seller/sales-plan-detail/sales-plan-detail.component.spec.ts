/* tslint:disable:no-unused-variable */
/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SalesPlanDetailComponent } from './sales-plan-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { SalesPlanService } from '../services/sales-plan.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MOCK_SALES_PLAN } from '../mocks/mock-sales-plan';

class MockSalesPlanService {
  getById = jasmine.createSpy('getById');
}

describe('SalesPlanDetailComponent', () => {
  let component: SalesPlanDetailComponent;
  let fixture: ComponentFixture<SalesPlanDetailComponent>;
  let salesPlanService: MockSalesPlanService;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    salesPlanService = new MockSalesPlanService();
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        SalesPlanDetailComponent,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        { provide: SalesPlanService, useValue: salesPlanService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'plan-123' : null)
              }
            }
          }
        },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesPlanDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should assign planId from route and load plan on init', fakeAsync(() => {
    salesPlanService.getById.and.returnValue(of(MOCK_SALES_PLAN));
    fixture.detectChanges();
    tick();

    expect(salesPlanService.getById).toHaveBeenCalledWith('plan-123');
    expect(component.salesPlan).toEqual(MOCK_SALES_PLAN);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeFalse();
  }));

  it('should handle error and set error flag if getById fails', fakeAsync(() => {
    salesPlanService.getById.and.returnValue(throwError(() => new Error('Not found')));
    fixture.detectChanges();
    tick();

    expect(component.salesPlan).toBeUndefined();
    expect(component.loading).toBeFalse();
    expect(component.error).toBeTrue();
  }));

  it('should navigate to edit page on editPlan()', () => {
    component.salesPlan = { ...MOCK_SALES_PLAN };
    component.editPlan();
    expect(router.navigate).toHaveBeenCalledWith([`/seller/edit-sales-plan/${MOCK_SALES_PLAN.id}`]);
  });

  it('should navigate to dashboard on cancel', () => {
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  });

  it('should set error and stop loading if no planId in route', () => {
    const route = TestBed.inject(ActivatedRoute);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(null);

    component.ngOnInit();

    expect(component.error).toBeTrue();
    expect(component.loading).toBeFalse();
    expect(component.salesPlan).toBeUndefined();
  });
});

