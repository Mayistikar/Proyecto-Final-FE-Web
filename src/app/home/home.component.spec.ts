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

  it('should navigate to manufacturer-dashboard on successful login with manufacturer role', async () => {
    spyOn(component.http, 'post').and.returnValue(of({
      id: '1',
      email: 'test@domain.com',
      role: 'manufacturer',
      id_token: 'id-token',
      access_token: 'access-token',
      refresh_token: 'refresh-token'
    }));
    spyOn(component.router, 'navigate');
    spyOn(component.authService, 'login');
    component.loginForm.setValue({ usuario: 'testuser', contrasena: '1234' });

    await component.onSubmit();

    expect(component.authService.login).toHaveBeenCalled();
    expect(component.router.navigate).toHaveBeenCalledWith(['/manufacturer-dashboard']);
  });

  it('should navigate to seller-dashboard on successful login with seller role', async () => {
    spyOn(component.http, 'post').and.returnValue(of({
      id: '2',
      email: 'seller@domain.com',
      role: 'seller',
      id_token: 'id-token',
      access_token: 'access-token',
      refresh_token: 'refresh-token'
    }));
    spyOn(component.router, 'navigate');
    spyOn(component.authService, 'login');
    component.loginForm.setValue({ usuario: 'seller', contrasena: '1234' });

    await component.onSubmit();

    expect(component.authService.login).toHaveBeenCalled();
    expect(component.router.navigate).toHaveBeenCalledWith(['/seller-dashboard']);
  });

  it('should navigate to home on successful login with other role', async () => {
    spyOn(component.http, 'post').and.returnValue(of({
      id: '3',
      email: 'admin@domain.com',
      role: 'admin',
      id_token: 'id-token',
      access_token: 'access-token',
      refresh_token: 'refresh-token'
    }));
    spyOn(component.router, 'navigate');
    spyOn(component.authService, 'login');
    component.loginForm.setValue({ usuario: 'admin', contrasena: '1234' });

    await component.onSubmit();

    expect(component.authService.login).toHaveBeenCalled();
    expect(component.router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should handle login error with status 401', async () => {
    spyOn(component.http, 'post').and.returnValue(throwError({ status: 401 }));
    spyOn(console, 'error');
    component.loginForm.setValue({ usuario: 'testuser', contrasena: '1234' });

    await component.onSubmit();

    expect(console.error).toHaveBeenCalledWith('Login failed', jasmine.any(Object));
    expect(component.pendingValidation).toBeFalse();
  });

  it('should handle login error with status 403 and set pendingValidation', async () => {
    spyOn(component.http, 'post').and.returnValue(throwError({ status: 403 }));
    component.loginForm.setValue({ usuario: 'testuser', contrasena: '1234' });

    await component.onSubmit();

    expect(component.pendingValidation).toBeTrue();
    expect(component.email).toBe('testuser');
  });
});
