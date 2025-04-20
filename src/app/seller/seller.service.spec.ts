import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SellerService } from './seller.service';
import { Seller } from './seller.model';
import { faker } from '@faker-js/faker';

describe('SellerService', () => {
  let service: SellerService;
  let httpMock: HttpTestingController;

  const BASE_URL = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod';
  const SELLER_ENDPOINT = `${BASE_URL}/auth/seller`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SellerService]
    });

    service = TestBed.inject(SellerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const createMockSeller = (): Seller => ({
    id: '',
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: '3' + faker.string.numeric(9),
    address: faker.location.streetAddress(),
    zone: 'Zona Sur',
    specialty: faker.person.jobTitle(),
    password: 'securePassword123'
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request on register', () => {
    const mockSeller = createMockSeller();

    service.register(mockSeller).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(SELLER_ENDPOINT);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should send POST request with correct seller data', () => {
    const mockSeller = createMockSeller();

    service.register(mockSeller).subscribe();

    const req = httpMock.expectOne(SELLER_ENDPOINT);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: mockSeller.email,
      password: mockSeller.password,
      confirm_password: mockSeller.password,
      full_name: mockSeller.name,
      phone: mockSeller.phone,
      address: mockSeller.address,
      sector_coverage: mockSeller.zone,
      experience: mockSeller.specialty
    });
    req.flush({ success: true });
  });

  it('should handle error response on register', () => {
    const mockSeller = createMockSeller();

    service.register(mockSeller).subscribe(
      () => fail('Expected an error'),
      error => expect(error.status).toBe(500)
    );

    const req = httpMock.expectOne(SELLER_ENDPOINT);
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle network error on register', () => {
    const mockSeller = createMockSeller();

    service.register(mockSeller).subscribe(
      () => fail('Expected a network error'),
      error => expect(error.message).toContain('Http failure response')
    );

    const req = httpMock.expectOne(SELLER_ENDPOINT);
    req.error(new ErrorEvent('Network error'));
  });

  it('should send POST request on login with correct credentials', () => {
    const credentials = {
      email: 'testuser@example.com',
      password: 'securePass123'
    };
  
    service.login(credentials).subscribe(response => {
      expect(response).toBeTruthy();
    });
  
    const req = httpMock.expectOne(`${BASE_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush({ token: 'mock-token' });
  });
  
  it('should send GET request to fetch all users', () => {
    const mockUsers = [
      { email: 'user1@example.com' },
      { email: 'user2@example.com' }
    ];
  
    service.getAllUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });
  
    const req = httpMock.expectOne(`${BASE_URL}/auth/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should send GET request to fetch stats', () => {
    const mockStats = {
      totalUsers: 100,
      activeSellers: 60,
      activeManufacturers: 40
    };
  
    service.getStats().subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });
  
    const req = httpMock.expectOne(`${BASE_URL}/api/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('should send GET request to check health endpoint', () => {
    service.checkHealth().subscribe(response => {
      expect(response).toEqual({ status: 'ok' });
    });
  
    const req = httpMock.expectOne(`${BASE_URL}/api/health`);
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'ok' });
  });


  it('should send DELETE request to delete database endpoint', () => {
    service.deleteDatabase().subscribe(response => {
      expect(response).toEqual({ message: 'Database deleted' });
    });
  
    const req = httpMock.expectOne(`${BASE_URL}/api/delete_database`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Database deleted' });
  });

  it('should send GET request to fetch seller by ID', () => {
    const mockSellerId = faker.string.uuid();
    const mockSellerResponse = {
      id: mockSellerId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: '3' + faker.string.numeric(9),
      address: faker.location.streetAddress(),
      zone: 'Zona Centro',
      specialty: faker.person.jobTitle()
    };
  
    service.getById(mockSellerId).subscribe(response => {
      expect(response).toEqual(mockSellerResponse);
    });
  
    const req = httpMock.expectOne(`${BASE_URL}/api/sellers/${mockSellerId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSellerResponse);
  });
  
});
