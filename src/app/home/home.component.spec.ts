import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'markForCheck']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        HomeComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
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

    // Use the mock directly instead of trying to inject it
    const component = new HomeComponent(
      new FormBuilder(),
      mockRouter,
      TestBed.inject(AuthService),
      TestBed.inject(HttpClient),
      mockChangeDetectorRef
    );

    expect(component.pendingValidation).toBeTrue();
    expect(component.userType).toBe('manufacturer');
    expect(component.email).toBe('test@example.com');

    tick(3000);
    expect(component.pendingValidation).toBeFalse();
  }));


  it('should handle login error with status 401', async () => {
    const errorObj = { status: 401, message: 'Unauthorized' };
    spyOn(component.http, 'post').and.returnValue(throwError(() => errorObj));
    const errorSpy = spyOn(console, 'error');
    component.loginForm.setValue({ usuario: 'testuser', contrasena: '1234' });

    await component.onSubmit();
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should handle login error with status 403 and set pendingValidation', async () => {
    spyOn(component.http, 'post').and.returnValue(throwError({ status: 403 }));
    component.loginForm.setValue({ usuario: 'testuser', contrasena: '1234' });

    await component.onSubmit();

    expect(component.pendingValidation).toBeTrue();
    expect(component.email).toBe('testuser');
  });

  it('should navigate to manufacturer dashboard on successful login with manufacturer role', async () => {
      spyOn(component.http, 'post').and.returnValue(of({ id: '1', email: 'test@example.com', role: 'manufacturer', id_token: 'token', access_token: 'access', refresh_token: 'refresh' }));
      spyOn(component.http, 'get').and.returnValue(of({ users: [{ email: 'test@example.com', profile: { operation_country: 'US' } }] }));
      const routerSpy = spyOn(component.router, 'navigate');

      component.loginForm.setValue({ usuario: 'test@example.com', contrasena: 'password' });
      await component.onSubmit();

      expect(routerSpy).toHaveBeenCalledWith(['/manufacturer-dashboard']);
    });

    it('should display error message for invalid credentials', async () => {
      spyOn(component.http, 'post').and.returnValue(throwError(() => ({ error: { error: 'Usuario no encontrado' } })));

      component.loginForm.setValue({ usuario: 'invalid@example.com', contrasena: 'wrongpassword' });
      await component.onSubmit();

      expect(component.errorMessage).toBe('Invalid credentials');
    });

    it('should set pendingValidation to true for 401 error', async () => {
      spyOn(component.http, 'post').and.returnValue(throwError(() => ({ status: 401 })));

      component.loginForm.setValue({ usuario: 'test@example.com', contrasena: 'password' });
      await component.onSubmit();

      expect(component.pendingValidation).toBeTrue();
    });

    it('should set pendingValidation and email for 403 error', async () => {
      spyOn(component.http, 'post').and.returnValue(throwError(() => ({ status: 403 })));

      component.loginForm.setValue({ usuario: 'test@example.com', contrasena: 'password' });
      await component.onSubmit();

      expect(component.pendingValidation).toBeTrue();
      expect(component.email).toBe('test@example.com');
    });

    it('should display server error message for 500 error', async () => {
      spyOn(component.http, 'post').and.returnValue(throwError(() => ({ status: 500 })));

      component.loginForm.setValue({ usuario: 'test@example.com', contrasena: 'password' });
      await component.onSubmit();

      expect(component.errorMessage).toBe('Server error');
    });

    it('should mark all fields as touched if form is invalid', async () => {
      component.loginForm.setValue({ usuario: '', contrasena: '' });

      await component.onSubmit();

      expect(component.loginForm.touched).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });
});
