import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { Router, NavigationExtras } from '@angular/router';
import { FormBuilder } from '@angular/forms';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
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
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}), // Mock params observable
            snapshot: { paramMap: { get: () => 'test-id' } } // Mock snapshot
          }
        }
      ]
    })
    .compileComponents();

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
    expect(console.log).toHaveBeenCalledWith('Usuario:', 'testuser', 'Contraseña:', 'testpass');
  });

  it('should log "Formulario inválido" when form is invalid', () => {
    spyOn(console, 'log');
    component.loginForm.setValue({ usuario: '', contrasena: '' });
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Formulario inválido');
  });

  it('should log "Formulario inválido" when password is too short', () => {
    spyOn(console, 'log');
    component.loginForm.setValue({ usuario: 'testuser', contrasena: '123' });
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Formulario inválido');
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
  
    const component = new HomeComponent(new FormBuilder(), mockRouter);
  
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
  
    const component = new HomeComponent(new FormBuilder(), mockRouter as any);
  
    expect(component.pendingValidation).toBeTrue();
    expect(component.userType).toBeNull();
    expect(component.email).toBeNull();
  
    tick(3000);
    expect(component.pendingValidation).toBeFalse();
  }));

});
