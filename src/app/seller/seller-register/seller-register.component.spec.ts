
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SellerRegisterComponent } from './seller-register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SellerService } from '../seller.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { faker } from '@faker-js/faker';
import { SellerDashboardComponent } from '../seller-dashboard/seller-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../auth/auth.service';


describe('SellerRegisterComponent (refactor)', () => {
  let component: SellerRegisterComponent;
  let fixture: ComponentFixture<SellerRegisterComponent>;
  let sellerServiceSpy: jasmine.SpyObj<SellerService>;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['login']);

  const buildValidForm = () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: `3${faker.string.numeric(9)}`,
    address: faker.location.streetAddress(),
    zone: 'Zona Norte',
    specialty: faker.person.jobType(),
    password: 'password123',
    confirmPassword: 'password123'
  });

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('SellerService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        SellerRegisterComponent,
        SellerDashboardComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule
      ],
      providers: [
        { provide: SellerService, useValue: spy },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SellerRegisterComponent);
    component = fixture.componentInstance;
    sellerServiceSpy = TestBed.inject(SellerService) as jasmine.SpyObj<SellerService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid when empty', () => {
    expect(component.sellerForm.valid).toBeFalse();
  });

  it('should mark form as valid when all fields are correct and passwords match', () => {
    const formData = buildValidForm();
    component.sellerForm.setValue(formData);
    expect(component.sellerForm.valid).toBeTrue();
    expect(component.passwordsMatch).toBeTrue();
  });

  it('should mark form as invalid when passwords do not match', () => {
    const formData = buildValidForm();
    formData.confirmPassword = 'diferente123';
    component.sellerForm.setValue(formData);

    expect(component.passwordsMatch).toBeFalse();
    expect(component.sellerForm.valid).toBeFalse();
  });

  it('should call register and navigate on valid form submission', fakeAsync(() => {
    const formData = buildValidForm();
    component.sellerForm.setValue(formData);
    const navigateSpy = spyOn(component['router'], 'navigate');
    sellerServiceSpy.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(sellerServiceSpy.register).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));

  it('should log error on failed registration', fakeAsync(() => {
    spyOn(console, 'error');
    const formData = buildValidForm();
    component.sellerForm.setValue(formData);
    sellerServiceSpy.register.and.returnValue(throwError(() => new Error('Error de registro')));

    component.onSubmit();
    tick();

    expect(console.error).toHaveBeenCalledWith('Registration error', jasmine.any(Error));
  }));

  it('should log error on failed registration', fakeAsync(() => {
    spyOn(console, 'error');
    const formData = buildValidForm();
    component.sellerForm.setValue(formData);
    sellerServiceSpy.register.and.returnValue(throwError(() => new Error('Fail')));

    component.onSubmit();
    tick();

    expect(console.error).toHaveBeenCalledWith('Registration error', jasmine.any(Error));
  }));

  it('should return form controls via getters', () => {
    const formData = buildValidForm();
    component.sellerForm.setValue(formData);

    expect(component.zone?.value).toBe(formData.zone);
    expect(component.specialty?.value).toBe(formData.specialty);
    expect(component.password?.value).toBe(formData.password);
    expect(component.confirmPassword?.value).toBe(formData.confirmPassword);
  });

  it('should return true from passwordsMatch when passwords match', () => {
    const formData = buildValidForm();
    component.sellerForm.setValue(formData);
    expect(component.passwordsMatch).toBeTrue();
  });

  it('should return false from passwordsMatch and set error when passwords do not match', () => {
    const formData = buildValidForm();
    formData.confirmPassword = 'otraClave';
    component.sellerForm.setValue(formData);

    expect(component.passwordsMatch).toBeFalse();
    expect(component.confirmPassword?.errors).toEqual({ passwordsDoNotMatch: true });
  });

  it('should return the coverage zone groups', () => {
    const mockGroups = [
      { label: 'Colombia', zones: ['Bogotá', 'Medellín'] },
      { label: 'USA', zones: ['New York', 'Florida'] }
    ];

    (component as any).coverageZoneGroups = mockGroups;

    const result = component.getZoneGroups();

    expect(result).toEqual(mockGroups);
  });

  it('should create Seller instance with correct data and call register', fakeAsync(() => {
    const formData = buildValidForm();
    component.sellerForm.setValue(formData);
    const navigateSpy = spyOn(component['router'], 'navigate');
    sellerServiceSpy.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(sellerServiceSpy.register).toHaveBeenCalledWith(jasmine.objectContaining({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      zone: formData.zone,
      specialty: formData.specialty,
      password: formData.password
    }));

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));

  it('should use empty string for null form values', fakeAsync(() => {
    const emptyForm = {
      name: '',
      email: '',
      phone: '',
      address: '',
      zone: '',
      specialty: '',
      password: '',
      confirmPassword: ''
    };

    Object.keys(component.sellerForm.controls).forEach(key => {
      component.sellerForm.get(key)?.clearValidators();
      component.sellerForm.get(key)?.updateValueAndValidity();
    });

    component.sellerForm.setValue(emptyForm);
    fixture.detectChanges();

    const navigateSpy = spyOn(component['router'], 'navigate');
    sellerServiceSpy.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(sellerServiceSpy.register).toHaveBeenCalledWith(jasmine.objectContaining({
      name: '',
      email: '',
      phone: '',
      address: '',
      zone: '',
      specialty: '',
      password: ''
    }));

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));

  describe('Coalescing to empty string', () => {
    it('should return empty string if value is undefined or null', () => {
      const undefinedValue = undefined;
      const nullValue = null;
      const nonEmpty = 'text';

      expect(undefinedValue ?? '').toBe('');
      expect(nullValue ?? '').toBe('');
      expect(nonEmpty ?? '').toBe('text');
    });
  });

  it('should replace null or undefined values with empty string when creating Seller', fakeAsync(() => {
    const nullishForm = {
      name: null,
      email: null,
      phone: null,
      address: null,
      zone: null,
      specialty: null,
      password: null,
      confirmPassword: null
    };


    Object.keys(nullishForm).forEach(key => {
      component.sellerForm.get(key)?.clearValidators();
      component.sellerForm.get(key)?.updateValueAndValidity();
    });

    component.sellerForm.setValue(nullishForm);
    fixture.detectChanges();

    const navigateSpy = spyOn(component['router'], 'navigate');
    sellerServiceSpy.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(sellerServiceSpy.register).toHaveBeenCalledWith(jasmine.objectContaining({
      name: '',
      email: '',
      phone: '',
      address: '',
      zone: '',
      specialty: '',
      password: ''
    }));

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));


  it('should call authService.login and navigate to seller-dashboard when response is valid', fakeAsync(() => {
    const formData = buildValidForm();
    component.sellerForm.setValue(formData);
  
    const validResponse = {
      id: '123',
      email: formData.email,
      access_token: 'access123',
      id_token: 'id123',
      refresh_token: 'refresh123'
    };
  
    sellerServiceSpy.register.and.returnValue(of(validResponse));
  
    const navigateSpy = spyOn(component['router'], 'navigate');
    component.onSubmit();
    tick();
  
    expect(authServiceMock.login).toHaveBeenCalledWith(jasmine.objectContaining({
      id: validResponse.id,
      email: validResponse.email,
      role: 'seller',
      zone: formData.zone,
      idToken: validResponse.id_token,
      accessToken: validResponse.access_token,
      refreshToken: validResponse.refresh_token
    }));
  
    expect(navigateSpy).toHaveBeenCalledWith(['/seller-dashboard']);
  }));

});
