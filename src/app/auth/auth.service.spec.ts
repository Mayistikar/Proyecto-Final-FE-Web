import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, UserData } from './auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { of , skip, take   } from 'rxjs';
import { MockAuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let router: Router;

  const mockUserData: UserData = {
    id: '1',
    email: 'test@example.com',
    role: 'user',
    zone: 'ZONE_TEST',
    idToken: 'idToken',
    accessToken: 'accessToken',
    refreshToken: 'refreshToken'
  };

  beforeEach(() => {
    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock }
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  it('should login a user and set tokens', () => {
    authService.login(mockUserData);

    expect(localStorage.getItem('user_id')).toBe(mockUserData.id);
    expect(localStorage.getItem('user_email')).toBe(mockUserData.email);
    expect(localStorage.getItem('user_role')).toBe(mockUserData.role);
    expect(localStorage.getItem('id_token')).toBe(mockUserData.idToken);
    expect(localStorage.getItem('access_token')).toBe(mockUserData.accessToken);
    expect(localStorage.getItem('refresh_token')).toBe(mockUserData.refreshToken);
  });

  it('should logout a user and clear tokens', () => {
    authService.login(mockUserData);
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
    authService.login(mockUserData);
    expect(authService.isLoggedIn()).toBe(true);
  });

  it('should return false if the user is not logged in', () => {
    authService.logout();
    expect(authService.isLoggedIn()).toBe(false);
  });

  it('should return user data', () => {
    const userCopy = { ...mockUserData }; 
    authService.login(userCopy);
  
    const result = authService.getUserData();
  
    expect(result).toEqual({
      id: userCopy.id,
      email: userCopy.email,
      role: userCopy.role,
      zone: userCopy.zone,  
      idToken: userCopy.idToken,
      accessToken: userCopy.accessToken,
      refreshToken: userCopy.refreshToken
    });
  });

  it('should return null after logout', () => {
    authService.login(mockUserData);
    authService.logout();
    expect(authService.getUserData()).toBeNull();
  });

  it('should return manufacturer object with companyName when role is "manufacturer"', () => {
    localStorage.setItem('user_id', 'm‑123');
    localStorage.setItem('user_email', 'maker@widgets.com');
    localStorage.setItem('user_role', 'manufacturer');

    const result = authService.getCurrentManufacturer();

    expect(result).toEqual({
      id: 'm‑123',
      email: 'maker@widgets.com',
      role: 'manufacturer',
      companyName: 'maker'
    });
  });

  it('should return null when role is not "manufacturer" or data missing', () => {
    localStorage.setItem('user_id', 'u‑1');
    localStorage.setItem('user_email', 'user@mail.com');
    localStorage.setItem('user_role', 'seller');
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

    freshService.login(mockUserData);
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
    const rawUser: any = {
      ...mockUserData,
      sector_coverage: 'ZONE_CALI'
    };

    authService.login(rawUser);

    expect(localStorage.getItem('user_zone')).toBe('ZONE_CALI');
    expect(localStorage.getItem('user_country')).toBe('COVERAGE_COLOMBIA');
  });

  it('should default country to COVERAGE_COLOMBIA when zone has no mapping', () => {
    const rawUser: any = {
      ...mockUserData,
      sector_coverage: 'ZONE_UNKNOWN'
    };

    authService.login(rawUser);
    expect(localStorage.getItem('user_country')).toBe('COVERAGE_COLOMBIA');
  });

  it('should return the correct user country from localStorage', () => {
    localStorage.setItem('user_country', 'COVERAGE_MEXICO');
    expect(authService.getUserCountry()).toBe('COVERAGE_MEXICO');
  });

  it('should return null when user country is not set', () => {
    localStorage.removeItem('user_country');
    expect(authService.getUserCountry()).toBeNull();
  });

  it('should call getUsers and return a list of manufacturers', () => {
    const mockUsers = {
      users: [
        {
          id: '1',
          email: 'a@b.com',
          role: 'manufacturer',
          authorized: true,
          created_at: '2024-01-01',
          cognito_id: 'abc123',
          profile: {
            id: 'p1',
            representative_name: 'Jane Smith',
            company_name: 'TechWidgets',
            company_address: '456 Avenue',
            contact_number: '555-6789',
            operation_country: 'COVERAGE_MEXICO',
            sector_coverage: 'ZONE_BOGOTA',
            phone: '555-9876',
            tax_id: 'TX-001122'
          }
        }
      ]
    };

    const httpClient = TestBed.inject(HttpClient);
    spyOn(httpClient, 'get').and.returnValue(of(mockUsers));

    authService.getUsers().subscribe(result => {
      expect(result).toEqual(mockUsers);
    });

    expect(httpClient.get).toHaveBeenCalledWith(
      'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/auth/users?role=manufacturer'
    );
  });

  it('should call authorizeUser with correct URL', () => {
    const httpClient = TestBed.inject(HttpClient);
    const mockUser = { id: '123' } as any;
    spyOn(httpClient, 'put').and.returnValue(of({ success: true }));
  
    authService.authorizeUser(mockUser).subscribe(response => {
      expect(response).toEqual({ success: true });
    });
  
    expect(httpClient.put).toHaveBeenCalledWith(
      'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/auth/manufacturer/123/authorize',
      {}
    );
  });

  it('should emit true when user is logged in through isAuthenticated', () => {
    const mock = new MockAuthService();
    const dummyUser: UserData = {
      id: '1',
      email: 'test@example.com',
      role: 'manufacturer',
      zone: 'ZONE_TEST',
      idToken: 'id123',
      accessToken: 'acc123',
      refreshToken: 'ref123'
    };
  
    mock.login(dummyUser);
  
    let result: boolean | undefined;
    mock.isAuthenticated.subscribe((value: boolean) => {
      result = value;
    });
  
    expect(result).toBeTrue();
  });
  
  it('should return "Colombia" from getUserCountry()', () => {
    const mock = new MockAuthService();
    expect(mock.getUserCountry()).toBe('Colombia');
  });
  
  it('should return "12345" from getUserId()', () => {
    const mock = new MockAuthService();
    expect(mock.getUserId()).toBe('12345');
  });
  
  describe('MockAuthService core methods', () => {
    const dummyUser: UserData = {
      id: '1',
      email: 'test@example.com',
      role: 'manufacturer',
      zone: 'ZONE_TEST',
      idToken: 'id123',
      accessToken: 'acc123',
      refreshToken: 'ref123'
    };
  
    it('should clear userData after logout()', () => {
      const mock = new MockAuthService();
      mock.login(dummyUser);
  
      mock.logout();
  
      expect(mock.getUserData()).toBeNull();
    });
  
    it('isLoggedIn() should return true when userData is present', () => {
      const mock = new MockAuthService();
      mock.login(dummyUser);
  
      expect(mock.isLoggedIn()).toBeTrue();
    });
  
    it('getUserData() should return null after logout()', () => {
      const mock = new MockAuthService();
      mock.login(dummyUser);
  
      mock.logout();
      const result = mock.getUserData();
  
      expect(result).toBeNull();
    });
  });

  it('should return manufacturer object with companyName when role is "manufacturer"', () => {
    localStorage.setItem('user_id', 'm‑123');
    localStorage.setItem('user_email', 'maker@widgets.com');
    localStorage.setItem('user_role', 'manufacturer');
  
    const result = authService.getCurrentManufacturer();
  
    expect(result).toEqual({
      id: 'm‑123',
      email: 'maker@widgets.com',
      role: 'manufacturer',
      companyName: 'maker'
    });
  });
  
  it('should return null when role is not "manufacturer" or data missing', () => {
    localStorage.setItem('user_id', 'u‑1');
    localStorage.setItem('user_email', 'user@mail.com');
    localStorage.setItem('user_role', 'seller');
    expect(authService.getCurrentManufacturer()).toBeNull();
  
    localStorage.clear();
    localStorage.setItem('user_role', 'manufacturer');
    expect(authService.getCurrentManufacturer()).toBeNull();
  });

  it('should return manufacturer from this.userData directly', () => {
    const manufacturerUser: UserData = {
      id: 'manu-001',
      email: 'factory@domain.com',
      role: 'manufacturer',
      zone: 'ZONE_X',
      idToken: 'id-token',
      accessToken: 'acc-token',
      refreshToken: 'ref-token',
    };
  
    authService.login(manufacturerUser);
    const result = authService.getCurrentManufacturer();
  
    expect(result).toEqual({
      id: 'manu-001',
      email: 'factory@domain.com',
      role: 'manufacturer',
      companyName: 'factory',
    });
  });


  it('should return manufacturer when userData has role "manufacturer"', () => {
    const manufacturerUser: UserData = {
      id: 'manu-01',
      email: 'fab@factory.com',
      role: 'manufacturer',
      zone: 'ZONE_X',
      idToken: 'id',
      accessToken: 'acc',
      refreshToken: 'ref',
    };
  
    authService.login(manufacturerUser); 
    const result = authService.getCurrentManufacturer();
  
    expect(result).toEqual({
      id: 'manu-01',
      email: 'fab@factory.com',
      role: 'manufacturer',
      companyName: 'fab',
    });
  });
  
  it('should return null when role is not manufacturer', () => {
    const sellerUser: UserData = {
      id: 'sell-01',
      email: 'sell@market.com',
      role: 'seller',
      zone: 'ZONE_M',
      idToken: 'id',
      accessToken: 'acc',
      refreshToken: 'ref',
    };
  
    authService.login(sellerUser);
    expect(authService.getCurrentManufacturer()).toBeNull();
  });
  
  it('should return null when userData is undefined', () => {
    expect(authService.getCurrentManufacturer()).toBeNull();
  });
  
  it('should emit isAuthenticated correctly', () => {
    const dummyUser: UserData = {
      id: 'auth-01',
      email: 'auth@test.com',
      role: 'manufacturer',
      zone: 'ZONE_Y',
      idToken: 'id',
      accessToken: 'acc',
      refreshToken: 'ref',
    };
  
    const values: boolean[] = [];
  
    const subscription = authService.isAuthenticated
      .pipe(skip(1))
      .subscribe(val => values.push(val));
  
    authService.login(dummyUser);
    authService.logout();
  
    subscription.unsubscribe();
  
    expect(values).toEqual([true, false]);
  });

  describe('resolveCoverage', () => {
    const SECTOR_TO_ZONE: Record<string, string> = {
      'SECTOR_01': 'ZONE_BOGOTA',
      'SECTOR_02': 'ZONE_MEDELLIN',
    };
  
    const ZONE_TO_COUNTRY: Record<string, string> = {
      'ZONE_BOGOTA': 'COVERAGE_COLOMBIA',
      'ZONE_MEDELLIN': 'COVERAGE_COLOMBIA',
    };
  
    const resolveCoverage = (sectorCoverage: string): { zone: string; country: string } => {
      const zone = SECTOR_TO_ZONE[sectorCoverage] ?? 'ZONE_BOGOTA';
      const country = ZONE_TO_COUNTRY[zone] ?? 'COVERAGE_COLOMBIA';
      return { zone, country };
    };
  
    it('should resolve a known sector to the correct zone and country', () => {
      const result = resolveCoverage('SECTOR_01');
      expect(result.zone).toBe('ZONE_BOGOTA');
      expect(result.country).toBe('COVERAGE_COLOMBIA');
    });
  
    it('should fallback to default zone and country if sector is unknown', () => {
      const result = resolveCoverage('SECTOR_X');
      expect(result.zone).toBe('ZONE_BOGOTA');
      expect(result.country).toBe('COVERAGE_COLOMBIA');
    });
  
    it('should fallback to default country if zone is unknown', () => {
      const customSECTOR_TO_ZONE: Record<string, string> = {
        'SECTOR_03': 'ZONE_UNKNOWN',
      };
      const customZONE_TO_COUNTRY: Record<string, string> = {};
  
      const resolveWithUnknownZone = (sectorCoverage: string): { zone: string; country: string } => {
        const zone = customSECTOR_TO_ZONE[sectorCoverage] ?? 'ZONE_BOGOTA';
        const country = customZONE_TO_COUNTRY[zone] ?? 'COVERAGE_COLOMBIA';
        return { zone, country };
      };
  
      const result = resolveWithUnknownZone('SECTOR_03');
      expect(result.zone).toBe('ZONE_UNKNOWN');
      expect(result.country).toBe('COVERAGE_COLOMBIA');
    });
  });

  it('should fallback to default zone and country when sectorCoverage is unknown', () => {
    const rawUser: any = {
      ...mockUserData,
      sector_coverage: 'UNKNOWN_SECTOR',
    };
  
    authService.login(rawUser);
  
    expect(localStorage.getItem('user_zone')).toBe('ZONE_BOGOTA');
    expect(localStorage.getItem('user_country')).toBe('COVERAGE_COLOMBIA');
  });

  it('should return manufacturer from internal _userData.value', () => {
    const manufacturerUser: UserData = {
      id: 'auth-02',
      email: 'test@factory.com',
      role: 'manufacturer',
      zone: 'ZONE_TEST',
      idToken: 'id',
      accessToken: 'acc',
      refreshToken: 'ref',
    };
  
    authService.login(manufacturerUser);
    const result = authService.getCurrentManufacturer();
  
    expect(result).toEqual({
      id: 'auth-02',
      email: 'test@factory.com',
      role: 'manufacturer',
      companyName: 'test',
    });
  });

  it('should return null from getCurrentManufacturer if _userData is null or not manufacturer', () => {
    authService.logout();
  
    expect(authService.getCurrentManufacturer()).toBeNull();
  
    const sellerUser: UserData = {
      id: 's1',
      email: 'seller@market.com',
      role: 'seller',
      zone: 'ZONE_1',
      idToken: 'id',
      accessToken: 'acc',
      refreshToken: 'ref',
    };
  
    authService.login(sellerUser);
    expect(authService.getCurrentManufacturer()).toBeNull();
  });
  

 it('should return null if userData is null', () => {
    authService.logout(); 
    const result = authService.getCurrentManufacturer();
    expect(result).toBeNull();
  });


  describe('getCurrentManufacturer()', () => {
    it('should return manufacturer object when userData role is "manufacturer"', () => {
      const manufacturerUser: UserData = {
        id: 'manu-123',
        email: 'company@example.com',
        role: 'manufacturer',
        zone: 'ZONE_X',
        idToken: 'token-id',
        accessToken: 'token-access',
        refreshToken: 'token-refresh',
      };
  
      authService.login(manufacturerUser);
  
      const result = authService.getCurrentManufacturer();
  
      expect(result).toEqual({
        id: 'manu-123',
        email: 'company@example.com',
        role: 'manufacturer',
        companyName: 'company', 
      });
    });
  
    it('should return null when userData role is not "manufacturer"', () => {
      const sellerUser: UserData = {
        id: 'sell-456',
        email: 'seller@store.com',
        role: 'seller',
        zone: 'ZONE_Y',
        idToken: 'id',
        accessToken: 'acc',
        refreshToken: 'ref',
      };
  
      authService.login(sellerUser);
  
      const result = authService.getCurrentManufacturer();
      expect(result).toBeNull();
    });
  
    it('should return null when userData is undefined', () => {
      authService.logout(); 
      const result = authService.getCurrentManufacturer();
      expect(result).toBeNull();
    });
  });

});
