import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManufacturerComponent } from './manufacturer.component';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('ManufacturerComponent', () => {
  let component: ManufacturerComponent;
  let fixture: ComponentFixture<ManufacturerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ManufacturerComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        TranslateService,
        TranslateStore,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}), // Mock params observable
            snapshot: { paramMap: { get: () => 'test-id' } } // Mock snapshot
          }
        },
        Router,
      ]
    })
      .compileComponents();

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
    spyOn(console, 'warn');
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
    expect(console.warn).toHaveBeenCalledWith(component.manufacturerForm.value);
  });
});
