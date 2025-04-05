import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      declarations: [HomeComponent],
      providers: [
        TranslateService,
        TranslateStore,
        FormBuilder,
        AuthService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}), // Mock params observable
            snapshot: { paramMap: { get: () => 'test-id' } } // Mock snapshot
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            getCurrentNavigation: () => ({
              extras: { state: { pendingValidation: true, userType: 'manufacturer', email: 'test@example.com' } }
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log user and password when form is valid', () => {
    spyOn(console, 'log');
    component.loginForm.setValue({ usuario: 'testuser', contrasena: 'testpass' });
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Login successful', jasmine.any(Object));
  });

  it('should log "Form invalid" when form is invalid', () => {
    spyOn(console, 'warn');
    component.loginForm.setValue({ usuario: '', contrasena: '' });
    component.onSubmit();
    expect(console.warn).toHaveBeenCalledWith('Form invalid');
  });

  it('should log "Form invalid" when password is too short', () => {
    spyOn(console, 'warn');
    component.loginForm.setValue({ usuario: 'testuser', contrasena: '123' });
    component.onSubmit();
    expect(console.warn).toHaveBeenCalledWith('Form invalid');
  });

  it('should set pendingValidation state from router navigation and clear it after timeout', fakeAsync(() => {
    const mockState = {
      pendingValidation: true,
      userType: 'manufacturer',
      email: 'test@example.com'
    };

    const mockRouter = {
      getCurrentNavigation: () => ({
        extras: { state: mockState }
      })
    } as any;

    const component = new HomeComponent(new FormBuilder(), mockRouter, TestBed.inject(AuthService), TestBed.inject(HttpClient), TestBed.inject(ChangeDetectorRef));

    expect(component.pendingValidation).toBeTrue();
    expect(component.userType).toBe('manufacturer');
    expect(component.email).toBe('test@example.com');

    tick(3000);
    expect(component.pendingValidation).toBeFalse();
  }));

  it('should set userType and email to null if not provided in state', fakeAsync(() => {
    const mockState = {
      pendingValidation: true
    };

    const mockRouter = {
      getCurrentNavigation: () => ({
        extras: {
          state: mockState
        }
      })
    };

    const component = new HomeComponent(new FormBuilder(), mockRouter as any, TestBed.inject(AuthService), TestBed.inject(HttpClient), TestBed.inject(ChangeDetectorRef));

    expect(component.pendingValidation).toBeTrue();
    expect(component.userType).toBeNull();
    expect(component.email).toBeNull();

    tick(3000);
    expect(component.pendingValidation).toBeFalse();
  }));
});
