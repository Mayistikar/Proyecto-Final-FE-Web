/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CreateSalesPlanComponent } from './create-sales-plan.component';
import { SalesPlanService } from '../services/sales-plan.service';
import { AuthService, UserData } from '../../auth/auth.service';
import { faker } from '@faker-js/faker';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateSalesPlanComponent', () => {
  let component: CreateSalesPlanComponent;
  let fixture: ComponentFixture<CreateSalesPlanComponent>;
  let mockSalesPlanService: jasmine.SpyObj<SalesPlanService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let toastr: ToastrService;
  let translate: TranslateService;

  const sellerUser: UserData = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    role: 'seller',
    zone: 'ZONE_TEST',
    idToken: faker.string.alphanumeric(10),
    accessToken: faker.string.alphanumeric(10),
    refreshToken: faker.string.alphanumeric(10)
  };

  beforeEach(async () => {
    mockSalesPlanService = jasmine.createSpyObj('SalesPlanService', ['create']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserData', 'getUserId']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CreateSalesPlanComponent,
        ReactiveFormsModule,
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
        { provide: SalesPlanService, useValue: mockSalesPlanService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSalesPlanComponent);
    component = fixture.componentInstance;
    toastr = TestBed.inject(ToastrService);
    translate = TestBed.inject(TranslateService);
  });

  it('should create the component', () => {
    mockAuthService.getUserData.and.returnValue(sellerUser);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should redirect to login if user is missing or invalid', () => {
    mockAuthService.getUserData.and.returnValue(null);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should mark form as touched and not submit if invalid', () => {
    mockAuthService.getUserData.and.returnValue(sellerUser);
    fixture.detectChanges();

    component.salesPlanForm.patchValue({
      name: '',
      description: '',
      visitRoute: '',
      dailyGoal: '',
      weeklyGoal: '',
      startTime: '',
      endTime: '',
      strategy: '',
      event: ''
    });

    spyOn(component.salesPlanForm, 'markAllAsTouched').and.callThrough();
    component.onSubmit();

    expect(component.salesPlanForm.markAllAsTouched).toHaveBeenCalled();
    expect(mockSalesPlanService.create).not.toHaveBeenCalled();
  });

  it('should validate time range correctly', () => {
    const group = component['fb'].group({
      startTime: ['15:00'],
      endTime: ['12:00']
    }, { validators: component.validateTimeRange });

    expect(group.errors).toEqual({ invalidTimeRange: true });

    group.patchValue({ endTime: '16:00' });
    expect(group.errors).toBeNull();
  });

  it('should submit form successfully and navigate on success', fakeAsync(() => {
    mockAuthService.getUserData.and.returnValue(sellerUser);
    mockAuthService.getUserId.and.returnValue(sellerUser.id);
    mockSalesPlanService.create.and.returnValue(of({
      id: faker.string.uuid(),
      sellerId: sellerUser.id,
      name: 'Plan Demo',
      description: 'Push strategy description',
      visitRoute: 'Route XYZ',
      dailyGoal: 10,
      weeklyGoal: 50,
      startTime: '08:00',
      endTime: '18:00',
      strategy: 'DIRECT_PROMOTION',
      event: 'LOCAL_CONCERT',
      createdAt: new Date().toISOString()
    }));

    fixture.detectChanges();

    component.salesPlanForm.setValue({
      name: 'Plan Demo',
      description: 'Push strategy description',
      visitRoute: 'Route XYZ',
      dailyGoal: 10,
      weeklyGoal: 50,
      startTime: '08:00',
      endTime: '18:00',
      strategy: 'DIRECT_PROMOTION',
      event: 'LOCAL_CONCERT'
    });

    spyOn(toastr, 'success').and.callThrough();
    spyOn(translate, 'instant').and.callFake((key: string) => key);

    component.onSubmit();
    tick(1500);

    expect(mockSalesPlanService.create).toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
    expect(component.isLoading).toBeFalse();
  }));

  it('should show error toast if getUserId returns null on submit', fakeAsync(() => {
    mockAuthService.getUserData.and.returnValue(sellerUser);
    mockAuthService.getUserId.and.returnValue(null);
    fixture.detectChanges();

    spyOn(toastr, 'error').and.callThrough();
    spyOn(translate, 'get').and.returnValue(of('Seller invalid'));

    component.salesPlanForm.setValue({
      name: 'Plan sin seller',
      description: 'Some valid description',
      visitRoute: 'Route ABC',
      dailyGoal: 5,
      weeklyGoal: 25,
      startTime: '09:00',
      endTime: '17:00',
      strategy: 'DIRECT_PROMOTION',
      event: 'LOCAL_CONCERT'
    });

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  }));

  it('should show error toast on backend error', fakeAsync(() => {
    mockAuthService.getUserData.and.returnValue(sellerUser);
    mockAuthService.getUserId.and.returnValue(sellerUser.id);
    mockSalesPlanService.create.and.returnValue(throwError(() => new Error('Backend error')));

    fixture.detectChanges();

    component.salesPlanForm.setValue({
      name: 'Plan Error',
      description: 'Another valid description',
      visitRoute: 'Route DEF',
      dailyGoal: 3,
      weeklyGoal: 15,
      startTime: '08:00',
      endTime: '17:00',
      strategy: 'DIRECT_PROMOTION',
      event: 'LOCAL_CONCERT'
    });

    spyOn(toastr, 'error').and.callThrough();
    spyOn(translate, 'instant').and.callFake((key: string) => key);

    component.onSubmit();
    tick();

    expect(toastr.error).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  }));

  it('should navigate to dashboard on cancel', () => {
    component.onCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  });
});
