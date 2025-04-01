import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SELLER_API_URL, SellerService } from './seller.service';
import { Seller } from './seller.model';
import { faker } from '@faker-js/faker';

describe('SellerService', () => {
  let service: SellerService;
  let httpMock: HttpTestingController;

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

    const req = httpMock.expectOne(SELLER_API_URL);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('should send POST request with correct seller data', () => {
    const mockSeller = createMockSeller();

    service.register(mockSeller).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(SELLER_API_URL);
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
      () => fail('expected an error, not a success'),
      error => expect(error.status).toBe(500)
    );

    const req = httpMock.expectOne(SELLER_API_URL);
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle network error on register', () => {
    const mockSeller = createMockSeller();

    service.register(mockSeller).subscribe(
      () => fail('expected a network error, not a success'),
      error => expect(error.message).toContain('Http failure response')
    );

    const req = httpMock.expectOne(SELLER_API_URL);
    req.error(new ErrorEvent('Network error'));
  });
});
