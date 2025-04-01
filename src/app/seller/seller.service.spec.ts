import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SellerService } from './seller.service';
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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request on register', () => {
    const mockSeller: Seller = {
      id: '',
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: '3' + faker.string.numeric(9),
      address: faker.location.streetAddress(),
      zone: 'Zona Sur',
      specialty: faker.person.jobTitle(),
      password: 'securePassword123'
    };

    service.register(mockSeller).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/sellers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSeller);
    req.flush({ success: true });
  });

  it('should send POST request with correct seller data', () => {
    const mockSeller: Seller = {
      id: '',
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: '3' + faker.string.numeric(9),
      address: faker.location.streetAddress(),
      zone: 'Zona Sur',
      specialty: faker.person.jobTitle(),
      password: 'securePassword123'
    };

    service.register(mockSeller).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/sellers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSeller);
    req.flush({ success: true });
  });

  it('should handle error response on register', () => {
    const mockSeller: Seller = {
      id: '',
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: '3' + faker.string.numeric(9),
      address: faker.location.streetAddress(),
      zone: 'Zona Sur',
      specialty: faker.person.jobTitle(),
      password: 'securePassword123'
    };

    service.register(mockSeller).subscribe(
      () => fail('expected an error, not a success'),
      error => expect(error.status).toBe(500)
    );

    const req = httpMock.expectOne('/api/sellers');
    expect(req.request.method).toBe('POST');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle network error on register', () => {
    const mockSeller: Seller = {
      id: '',
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: '3' + faker.string.numeric(9),
      address: faker.location.streetAddress(),
      zone: 'Zona Sur',
      specialty: faker.person.jobTitle(),
      password: 'securePassword123'
    };

    service.register(mockSeller).subscribe(
      () => fail('expected a network error, not a success'),
      error => expect(error.message).toContain('Http failure response')
    );

    const req = httpMock.expectOne('/api/sellers');
    expect(req.request.method).toBe('POST');
    req.error(new ErrorEvent('Network error'));
  });
});
