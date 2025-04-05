import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
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

});
