import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManufacturerService } from './manufacturer.service';

describe('ManufacturerService', () => {
  let service: ManufacturerService;
  let httpMock: HttpTestingController;

  const BASE_URL = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod';

  const mockPayload = {
    email: 'test@example.com',
    password: 'password123',
    confirm_password: 'password123',
    representative_name: 'Test Rep',
    company_name: 'Test Company',
    company_address: '123 Main St',
    phone: '+1234567890',
    operation_country: 'Test Country',
    tax_id: '987654321'
  };

  const mockCredentials = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ManufacturerService]
    });
    service = TestBed.inject(ManufacturerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login a user via POST', () => {
    service.login(mockCredentials).subscribe(res => {
      expect(res).toEqual({ token: 'jwt-token' });
    });

    const req = httpMock.expectOne(`${BASE_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    req.flush({ token: 'jwt-token' });
  });

  it('should fetch all users via GET', () => {
    const mockUsers = ['user1', 'user2'];

    service.getAllUsers().subscribe(res => {
      expect(res).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`${BASE_URL}/auth/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should fetch stats via GET', () => {
    const mockStats = { manufacturers: 10, sellers: 20 };

    service.getStats().subscribe(res => {
      expect(res).toEqual(mockStats);
    });

    const req = httpMock.expectOne(`${BASE_URL}/api/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('should check health via GET', () => {
    const mockHealth = { status: 'ok' };

    service.checkHealth().subscribe(res => {
      expect(res).toEqual(mockHealth);
    });

    const req = httpMock.expectOne(`${BASE_URL}/api/health`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHealth);
  });

  it('should delete the database via DELETE', () => {
    const mockResponse = { message: 'Database deleted' };

    service.deleteDatabase().subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${BASE_URL}/api/delete_database`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});


