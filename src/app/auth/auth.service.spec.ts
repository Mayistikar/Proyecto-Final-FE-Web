import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, UserData } from './auth.service';
import {HttpClient} from '@angular/common/http';

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
        { provide: Router, useValue: routerMock },
        { provide: HttpClient, useValue: {} }
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
      zone: 'ZONE_TEST',
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
    const inputUserData: UserData = {
      id: '1',
      email: 'test@example.com',
      role: 'user',
      zone: 'ZONE_TEST',
      idToken: 'idToken',
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    };
  
    authService.login(inputUserData);
  
    const result = authService.getUserData();
  
    expect(result).toBeTruthy();
    expect(result?.id).toBe(inputUserData.id);
    expect(result?.email).toBe(inputUserData.email);
    expect(result?.role).toBe(inputUserData.role);
    expect(result?.idToken).toBe(inputUserData.idToken);
    expect(result?.accessToken).toBe(inputUserData.accessToken);
    expect(result?.refreshToken).toBe(inputUserData.refreshToken);
  });

  it('should return manufacturer object with companyName when role is "manufacturer"', () => {
    localStorage.setItem('user_id',    'm‑123');
    localStorage.setItem('user_email', 'maker@widgets.com');
    localStorage.setItem('user_role',  'manufacturer');

    const result = authService.getCurrentManufacturer();

    expect(result).toEqual({
      id: 'm‑123',
      email: 'maker@widgets.com',
      role: 'manufacturer',
      companyName: 'maker'
    });
  });

  it('should return null when role is not "manufacturer" or data missing', () => {
    localStorage.setItem('user_id',    'u‑1');
    localStorage.setItem('user_email', 'user@mail.com');
    localStorage.setItem('user_role',  'seller');

    expect(authService.getCurrentManufacturer()).toBeNull();

    localStorage.clear();
    localStorage.setItem('user_role', 'manufacturer');
    expect(authService.getCurrentManufacturer()).toBeNull();
  });

  it('isAuthenticated observable should emit the correct sequence (fresh instance)', () => {
    localStorage.clear();

    const freshService = new AuthService(
      TestBed.inject(Router),
      TestBed.inject(HttpClient)
    );

    const emitted: boolean[] = [];
    const sub = freshService.isAuthenticated.subscribe(v => emitted.push(v));

    expect(emitted).toEqual([false]);

    freshService.login();
    expect(emitted[emitted.length - 1]).toBeTrue();

    freshService.logout();
    expect(emitted[emitted.length - 1]).toBeFalse();

    sub.unsubscribe();
  });

  it('should return null when not all user tokens are present', () => {
    localStorage.clear();
    localStorage.setItem('user_id', '1');

    const result = authService.getUserData();
    expect(result).toBeNull();
    });


    it('should assign zone and country directly if sector_coverage starts with "ZONE_"', () => {
      const userData: UserData = {
        id: '1',
        email: 'test@zone.com',
        role: 'manufacturer',
        idToken: 'id-token',
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };
    
      const rawUser = {
        ...userData,
        sector_coverage: 'ZONE_CALI'
      };
    
      localStorage.clear();
      authService.login(rawUser);
    
      expect(localStorage.getItem('user_zone')).toBe('ZONE_CALI');
      expect(localStorage.getItem('user_country')).toBe('COVERAGE_COLOMBIA'); // si no está definido en mapa
    });

    it('should default country to COVERAGE_COLOMBIA when zone has no mapping', () => {
      const userData: UserData = {
        id: '1',
        email: 'user@nomap.com',
        role: 'manufacturer',
        idToken: 'id',
        accessToken: 'access',
        refreshToken: 'refresh',
        zone: 'ZONE_UNKNOWN'
      };
    
      const rawUser = {
        ...userData,
        sector_coverage: 'ZONE_UNKNOWN' 
      };
    
      localStorage.clear();
      authService.login(rawUser);
    
      expect(localStorage.getItem('user_country')).toBe('COVERAGE_COLOMBIA');
    });
    


});
