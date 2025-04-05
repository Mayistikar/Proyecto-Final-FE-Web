import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    authService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: routerMock }
      ]
    });

    authGuard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should allow the authenticated user to access app', () => {
    authService.isLoggedIn.and.returnValue(true);
    expect(authGuard.canActivate()).toBe(true);
  });

  it('should redirect an unauthenticated user to the login route', () => {
    authService.isLoggedIn.and.returnValue(false);
    expect(authGuard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
