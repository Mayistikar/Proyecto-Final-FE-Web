//seller.service.spec.ts

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { faker } from '@faker-js/faker';

import { SellerService } from './seller.service';
import { Seller }        from './seller.model';

const BASE_URL              = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod';
const AUTH_SELLERS_ENDPOINT = `${BASE_URL}/auth/users?role=seller`;
const API_SELLERS_ENDPOINT  = `${BASE_URL}/api/sellers`;

describe('SellerService', () => {
  let service : SellerService;
  let httpCtl : HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SellerService]
    });

    service = TestBed.inject(SellerService);
    httpCtl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpCtl.verify());

  const createMockSeller = (): Seller => ({
    id       : faker.string.uuid(),
    name     : faker.person.fullName(),
    email    : faker.internet.email(),
    phone    : '3' + faker.string.numeric(9),
    address  : faker.location.streetAddress(),
    zone     : 'Zona Sur',
    specialty: faker.person.jobTitle(),
    password : 'securePassword123'
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('login() debe enviar POST /auth/login con credenciales', () => {
    const credentials = { email: 'user@example.com', password: 'pass123' };

    service.login(credentials).subscribe(res => expect(res).toEqual({ token: 't' }));

    const req = httpCtl.expectOne(`${BASE_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush({ token: 't' });
  });

  it('getAll() obtiene vendedores vía /auth/users?role=seller y los mapea', () => {
    const backend = [
      {
        id: '1',
        email: 'alice@mail.com',
        profile: {
          full_name: 'Alice',
          phone: '123',
          address: 'A st',
          sector_coverage: 'Z1',
          experience: 'Senior'
        }
      }
    ];

    let sellers: Seller[] | undefined;
    service.getAll().subscribe(list => (sellers = list));

    const req = httpCtl.expectOne(AUTH_SELLERS_ENDPOINT);
    expect(req.request.method).toBe('GET');
    req.flush(backend);

    expect(sellers!.length).toBe(1);
    expect(sellers![0]).toEqual(
      jasmine.objectContaining({ id: '1', name: 'Alice', email: 'alice@mail.com' })
    );
  });

  it('getAll() hace fallback a /api/sellers si /auth/users falla', () => {
    const fallbackBackend = [
      {
        id: '2',
        full_name: 'Bob',
        email: 'bob@mail.com',
        phone: '456',
        address: 'B st',
        sector_coverage: 'Z2',
        experience: 'Junior'
      }
    ];

    let sellers: Seller[] | undefined;
    service.getAll().subscribe(list => (sellers = list));

    const req1 = httpCtl.expectOne(AUTH_SELLERS_ENDPOINT);
    req1.error(new ProgressEvent('network'));

    const req2 = httpCtl.expectOne(API_SELLERS_ENDPOINT);
    expect(req2.request.method).toBe('GET');
    req2.flush(fallbackBackend);

    expect(sellers!.length).toBe(1);
    expect(sellers![0]).toEqual(
      jasmine.objectContaining({ id: '2', name: 'Bob', email: 'bob@mail.com' })
    );
  });

  it('getStats() debe hacer GET /api/stats', () => {
    const mockStats = { total: 10 };
    service.getStats().subscribe(s => expect(s).toEqual(mockStats));

    const req = httpCtl.expectOne(`${BASE_URL}/api/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('checkHealth() debe hacer GET /api/health', () => {
    service.checkHealth().subscribe(r => expect(r).toEqual({ status: 'ok' }));
    const req = httpCtl.expectOne(`${BASE_URL}/api/health`);
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'ok' });
  });

  it('deleteDatabase() debe hacer DELETE /api/delete_database', () => {
    service.deleteDatabase().subscribe(r =>
      expect(r).toEqual({ message: 'Database deleted' })
    );
    const req = httpCtl.expectOne(`${BASE_URL}/api/delete_database`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Database deleted' });
  });

  it('getById() debe hacer GET /api/sellers/:id', () => {
    const id   = faker.string.uuid();
    const mock = createMockSeller();
    mock.id = id;

    service.getById(id).subscribe(r => expect(r).toEqual(mock));
    const req = httpCtl.expectOne(`${BASE_URL}/api/sellers/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getStats() debe hacer GET /api/stats', () => {
    const mockStats = { total: 10 };
    service.getStats().subscribe(s => expect(s).toEqual(mockStats));

    const req = httpCtl.expectOne(`${BASE_URL}/api/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('checkHealth() debe hacer GET /api/health', () => {
    service.checkHealth().subscribe(r => expect(r).toEqual({ status: 'ok' }));
    const req = httpCtl.expectOne(`${BASE_URL}/api/health`);
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'ok' });
  });

  it('deleteDatabase() debe hacer DELETE /api/delete_database', () => {
    service.deleteDatabase().subscribe(r =>
      expect(r).toEqual({ message: 'Database deleted' })
    );
    const req = httpCtl.expectOne(`${BASE_URL}/api/delete_database`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Database deleted' });
  });

  it('register() debe hacer POST /api/create_seller con el payload correcto', () => {
    const seller = createMockSeller();
    const payload = {
      email: seller.email,
      password: seller.password,
      confirm_password: seller.password,
      full_name: seller.name,
      phone: seller.phone,
      address: seller.address,
      sector_coverage: seller.zone,
      experience: seller.specialty
    };
  
    service.register(seller).subscribe(res => expect(res).toEqual({ success: true }));
  
    const req = httpCtl.expectOne(`${BASE_URL}/api/create_seller`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });


  it('getAll() mapea vendedor usando email cuando no hay full_name ni otros campos opcionales', () => {
    const backend = [{
      id: '123',
      email: 'no-name@mail.com',
      profile: {} 
    }];
  
    let sellers: Seller[] | undefined;
    service.getAll().subscribe(list => (sellers = list));
  
    const req = httpCtl.expectOne(AUTH_SELLERS_ENDPOINT);
    req.flush(backend);
  
    expect(sellers!.length).toBe(1);
    expect(sellers![0]).toEqual({
      id: '123',
      name: 'no-name@mail.com', 
      email: 'no-name@mail.com',
      phone: '',
      address: '',
      zone: '',
      specialty: '',
      password: ''
    });
  });

  it('getAll() (fallback) mapea vendedor usando email cuando no hay full_name ni campos opcionales', () => {
    const fallbackBackend = [{
      id: '999',
      email: 'fallback@mail.com',
    }];
  
    let sellers: Seller[] | undefined;
    service.getAll().subscribe(list => (sellers = list));
  
    const req1 = httpCtl.expectOne(AUTH_SELLERS_ENDPOINT);
    req1.error(new ProgressEvent('network'));
  
    const req2 = httpCtl.expectOne(API_SELLERS_ENDPOINT);
    expect(req2.request.method).toBe('GET');
    req2.flush(fallbackBackend);
  
    expect(sellers!.length).toBe(1);
    expect(sellers![0]).toEqual({
      id: '999',
      name: 'fallback@mail.com', 
      email: 'fallback@mail.com',
      phone: '',
      address: '',
      zone: '',
      specialty: '',
      password: ''
    });
  });

  
});

