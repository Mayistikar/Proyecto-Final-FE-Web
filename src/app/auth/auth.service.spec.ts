import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, UserData } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock }
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  it('should login a user and set tokens', () => {
    const userData: UserData = {
      id: '1',
      email: 'test@example.com',
      role: 'user',
      idToken: 'idToken',
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    };

    authService.login(userData);

    expect(localStorage.getItem('user_id')).toBe(userData.id);
    expect(localStorage.getItem('user_email')).toBe(userData.email);
    expect(localStorage.getItem('user_role')).toBe(userData.role);
    expect(localStorage.getItem('id_token')).toBe(userData.idToken);
    expect(localStorage.getItem('access_token')).toBe(userData.accessToken);
    expect(localStorage.getItem('refresh_token')).toBe(userData.refreshToken);
  });

  it('should logout a user and clear tokens', () => {
    authService.logout();

    expect(localStorage.getItem('user_id')).toBeNull();
    expect(localStorage.getItem('user_email')).toBeNull();
    expect(localStorage.getItem('user_role')).toBeNull();
    expect(localStorage.getItem('id_token')).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return true if the user is logged in', () => {
    authService.login();
    expect(authService.isLoggedIn()).toBe(true);
  });

  it('should return false if the user is not logged in', () => {
    authService.logout();
    expect(authService.isLoggedIn()).toBe(false);
  });

  it('should return user data', () => {
    const userData: UserData = {
      id: '1',
      email: 'test@example.com',
      role: 'user',
      idToken: 'idToken',
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    };

    authService.login(userData);
    expect(authService.getUserData()).toEqual(userData);
  });
});
