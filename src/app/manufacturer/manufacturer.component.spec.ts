import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ManufacturerComponent } from './manufacturer.component';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ManufacturerService } from './manufacturer.service';
import { Router } from '@angular/router';
import { fakeAsync, tick } from '@angular/core/testing';

describe('ManufacturerComponent', () => {
  let component: ManufacturerComponent;
  let fixture: ComponentFixture<ManufacturerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ManufacturerComponent, 
        TranslateModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        ManufacturerService,
        TranslateService,
        TranslateStore,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            snapshot: { paramMap: { get: () => 'test-id' } }
          }
        },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufacturerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create form with default values', () => {
    expect(component.manufacturerForm.value).toEqual({
      manufacturerName: '',
      companyName: '',
      companyAddress: '',
      companyCountry: '',
      manufacturerEmail: '',
      manufacturerPhone: '',
      manufacturerRUC: '',
      password: '',
      confirmPassword: ''
    });
  });

  it('should mark form as invalid if required fields are empty', () => {
    component.manufacturerForm.setValue({
      manufacturerName: '',
      companyName: '',
      companyAddress: '',
      companyCountry: '',
      manufacturerEmail: '',
      manufacturerPhone: '',
      manufacturerRUC: '',
      password: '',
      confirmPassword: ''
    });
    expect(component.manufacturerForm.invalid).toBeTrue();
  });

  it('should mark form as invalid if email is not valid', () => {
    component.manufacturerForm.get('manufacturerEmail')!.setValue('invalid-email');
    expect(component.manufacturerForm.get('manufacturerEmail')!.invalid).toBeTrue();
  });

  it('should mark form as invalid if phone number is not valid', () => {
    component.manufacturerForm.get('manufacturerPhone')!.setValue('123');
    expect(component.manufacturerForm.get('manufacturerPhone')!.invalid).toBeTrue();
  });

  it('should mark form as invalid if RUC is not valid', () => {
    component.manufacturerForm.get('manufacturerRUC')!.setValue('123');
    expect(component.manufacturerForm.get('manufacturerRUC')!.invalid).toBeTrue();
  });

  it('should mark form as invalid if passwords do not match', () => {
    component.manufacturerForm.get('password')!.setValue('password123');
    component.manufacturerForm.get('confirmPassword')!.setValue('password456');
    expect(component.passwordsMatch).toBeFalse();
    expect(component.manufacturerForm.get('confirmPassword')!.errors).toEqual({ passwordsDoNotMatch: true });
  });

  it('should mark form as valid if all fields are valid', () => {
    component.manufacturerForm.setValue({
      manufacturerName: 'Valid Name',
      companyName: 'Valid Company',
      companyAddress: 'Valid Address',
      companyCountry: 'Valid Country',
      manufacturerEmail: 'valid@example.com',
      manufacturerPhone: '+1234567890',
      manufacturerRUC: '1234567890123',
      password: 'password123',
      confirmPassword: 'password123'
    });
    expect(component.manufacturerForm.valid).toBeTrue();
  });

  it('should log form value on submit if form is valid', () => {
    spyOn(console, 'log'); // 👈 usar log, no warn
  
    component.manufacturerForm.setValue({
      manufacturerName: 'Valid Name',
      companyName: 'Valid Company',
      companyAddress: 'Valid Address',
      companyCountry: 'Valid Country',
      manufacturerEmail: 'valid@example.com',
      manufacturerPhone: '+1234567890',
      manufacturerRUC: '1234567890123',
      password: 'password123',
      confirmPassword: 'password123'
    });
  
    component.onSubmit();
  
    expect(console.log).toHaveBeenCalledWith('Payload to send:', jasmine.objectContaining({
      email: 'valid@example.com',
      password: 'password123',
      confirm_password: 'password123',
      representative_name: 'Valid Name',
      company_name: 'Valid Company',
      company_address: 'Valid Address',
      phone: '+1234567890',
      operation_country: 'Valid Country',
      tax_id: '1234567890123'
    }));
  });

  it('should call register and navigate on successful submission', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const registerSpy = spyOn(component['manufacturerService'], 'register').and.returnValue(of({}));
  
    const formValue = {
      manufacturerName: 'Valid Name',
      companyName: 'Valid Company',
      companyAddress: 'Valid Address',
      companyCountry: 'Valid Country',
      manufacturerEmail: 'valid@example.com',
      manufacturerPhone: '+1234567890',
      manufacturerRUC: '1234567890123',
      password: 'password123',
      confirmPassword: 'password123'
    };
  
    component.manufacturerForm.setValue(formValue);
  
    jasmine.clock().install();
  
    component.onSubmit();

    expect(registerSpy).toHaveBeenCalled();
    expect(component.successMessageVisible).toBeTrue();
  
    jasmine.clock().tick(3501);
  
    expect(navigateSpy).toHaveBeenCalledWith(['/'], {
      state: {
        pendingValidation: true,
        userType: 'manufacturer',
        email: formValue.manufacturerEmail
      }
    });
  
    jasmine.clock().uninstall();
  });

  it('should log warning and not submit if form is invalid or passwords do not match', () => {
    const registerSpy = spyOn(component['manufacturerService'], 'register');
    const warnSpy = spyOn(console, 'warn');
    const tableSpy = spyOn(console, 'table');
  
    component.manufacturerForm.setValue({
      manufacturerName: 'Nombre',
      companyName: 'Compañía',
      companyAddress: 'Dirección',
      companyCountry: 'País',
      manufacturerEmail: 'correo@valido.com',
      manufacturerPhone: '+1234567890',
      manufacturerRUC: '1234567890123',
      password: 'password123',
      confirmPassword: 'diferentePassword' 
    });
  
    component.onSubmit();
  
    expect(warnSpy).toHaveBeenCalledWith('Form is invalid');
    expect(tableSpy).toHaveBeenCalledWith(component.manufacturerForm.value);
    expect(registerSpy).not.toHaveBeenCalled();
  });
  
  it('should display and hide error message on registration failure', fakeAsync(() => {
    spyOn(component['manufacturerService'], 'register').and.returnValue(
      throwError(() => new Error('Error al registrar'))
    );
  
    component.manufacturerForm.setValue({
      manufacturerName: 'Nombre',
      companyName: 'Compañía',
      companyAddress: 'Dirección',
      companyCountry: 'País',
      manufacturerEmail: 'correo@valido.com',
      manufacturerPhone: '+1234567890',
      manufacturerRUC: '1234567890123',
      password: 'password123',
      confirmPassword: 'password123'
    });
  
    component.onSubmit();
  
    expect(component.errorMessageVisible).toBeTrue();

    tick(5000);
    expect(component.errorMessageVisible).toBeFalse();
  }));

  it('should send tax_id as null if manufacturerRUC is empty string', () => {
    const registerSpy = spyOn(component['manufacturerService'], 'register').and.returnValue(of({}));
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
  
    const rucControl = component.manufacturerForm.get('manufacturerRUC');
    rucControl?.clearValidators();
    rucControl?.updateValueAndValidity();
  
    component.manufacturerForm.setValue({
      manufacturerName: 'Nombre',
      companyName: 'Compañía',
      companyAddress: 'Dirección',
      companyCountry: 'País',
      manufacturerEmail: 'correo@valido.com',
      manufacturerPhone: '+1234567890',
      manufacturerRUC: '', 
      password: 'password123',
      confirmPassword: 'password123'
    });
  
    component.onSubmit();
  
    expect(registerSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      tax_id: null
    }));
  });

});