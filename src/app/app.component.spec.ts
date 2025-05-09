import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService, UserData } from './auth/auth.service';
import { BehaviorSubject } from 'rxjs';

describe('AppComponent', () => {
  let authServiceStub: Partial<AuthService>;
  let userDataSubject: BehaviorSubject<UserData | null>;

  beforeEach(async () => {
    userDataSubject = new BehaviorSubject<UserData | null>(null);

    authServiceStub = {
      logout: jasmine.createSpy('logout'),
      userData$: userDataSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslateModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        TranslateService,
        TranslateStore,
        { provide: AuthService, useValue: authServiceStub }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'proyecto-final-web' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('proyecto-final-web');
  });

  it('should change language to Spanish', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    spyOn(app.getTranslateService(), 'use');
    app.changeLanguage('es');
    expect(app.getTranslateService().use).toHaveBeenCalledWith('es');
  });

  it('should change language to English', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    spyOn(app.getTranslateService(), 'use');
    app.changeLanguage('en');
    expect(app.getTranslateService().use).toHaveBeenCalledWith('en');
  });

  it('should have default language as English', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.getTranslateService().getDefaultLang()).toEqual('en');
  });

  it('should add English and Spanish as available languages', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.getTranslateService().getLangs()).toEqual(['en', 'es']);
  });

  it('should navigate to home when goHome is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    app.goHome();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to /warehouse when goWarehouse is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    app.goWarehouse();
    expect(navigateSpy).toHaveBeenCalledWith(['/warehouse']);
  });

  it('should navigate to /admin when goAuthorization is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    app.goAuthorization();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
  });

  it('should call AuthService.logout and redirect to /login?logout=true', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    app.logout();

    expect(authServiceStub.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(
      ['/login'],
      { queryParams: { logout: true } }
    );
  });

  it('should update userData when userData$ emits a value', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const mockUser: UserData = {
      id: '4',
      email: 'guest@example.com',
      role: 'unknown_role',
      zone: 'ZONE_BOGOTA',
      idToken: 'token',
      accessToken: 'access',
      refreshToken: 'refresh'
    };

    fixture.detectChanges(); 
    userDataSubject.next(mockUser);

    expect(app.userData).toEqual(mockUser);
  });

  it('should navigate to /performance-dashboard when goPerformanceDashboard is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
  
    app.goPerformanceDashboard();
  
    expect(navigateSpy).toHaveBeenCalledWith(['/performance-dashboard']);
  });
});
