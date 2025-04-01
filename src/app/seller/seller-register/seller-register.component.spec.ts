
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SellerRegisterComponent } from './seller-register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SellerService } from '../seller.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { faker } from '@faker-js/faker';

describe('SellerRegisterComponent (refactor)', () => {
  let component: SellerRegisterComponent;
  let fixture: ComponentFixture<SellerRegisterComponent>;
  let sellerServiceSpy: jasmine.SpyObj<SellerService>;

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
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: SellerService, useValue: spy }
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
    expect(navigateSpy).toHaveBeenCalledWith(['/seller-dashboard']);
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

});
