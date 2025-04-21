/* tslint:disable:no-unused-variable */
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SalesPlanService } from './sales-plan.service';
import { SalesPlan } from '../../models/sales-plan.model';
import { faker } from '@faker-js/faker';
import { MOCK_SALES_PLAN } from '../mocks/mock-sales-plan';

describe('SalesPlanService', () => {
  let service: SalesPlanService;
  let httpMock: HttpTestingController;

  const baseUrl = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api';

  const mockPlan: SalesPlan = {
    id: 'fc969255-6b5d-4bba-9795-4470745face8',
    sellerId: '9825eeb9-280b-4598-b73b-f94432355735',
    name: 'Campbell, Bell and Olson',
    description: 'Stuff whom site consumer.',
    dailyGoal: 7,
    weeklyGoal: 35,
    startTime: '08:00',
    endTime: '17:00',
    visitRoute: 'ROUTE_BOGOTA_NORTE',
    strategy: 'play',
    event: 'statement',
    createdAt: '1979-01-23T06:09:38'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SalesPlanService]
    });
    service = TestBed.inject(SalesPlanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a sales plan', () => {
    service.create(mockPlan).subscribe(response => {
      expect(response).toEqual(mockPlan);
    });

    const req = httpMock.expectOne(`${baseUrl}/sales-plans`);
    expect(req.request.method).toBe('POST');
    req.flush(mockPlan);
  });

  it('should get sales plans by seller', () => {
    const mockPlans = [mockPlan];

    service.getSalesPlansBySeller(mockPlan.sellerId).subscribe(response => {
      expect(response.data).toEqual(mockPlans);
      expect(response.usedMock).toBeFalse();
    });

    const req = httpMock.expectOne(`${baseUrl}/sales-plans/seller/${mockPlan.sellerId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlans);
  });

  it('should get a sales plan by ID', () => {
    service.getById(mockPlan.id).subscribe(response => {
      expect(response).toEqual(mockPlan);
    });

    const req = httpMock.expectOne(`${baseUrl}/sales-plans/${mockPlan.id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlan);
  });

  it('should update a sales plan', () => {
    const updatedPlan = { ...mockPlan, name: 'Updated Plan' };

    service.update(updatedPlan.id, updatedPlan).subscribe(response => {
      expect(response).toEqual(updatedPlan);
    });

    const req = httpMock.expectOne(`${baseUrl}/sales-plans/${updatedPlan.id}`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedPlan);
  });

  it('should return MOCK_SALES_PLAN if id is "mock-id"', () => {
    service.getById('mock-id').subscribe(response => {
      expect(response).toEqual(MOCK_SALES_PLAN);
    });

    httpMock.expectNone(`${baseUrl}/sales-plans/mock-id`);
  });

  it('should return MOCK_SALES_PLAN on getSalesPlansBySeller() error', () => {
    service.getSalesPlansBySeller(mockPlan.sellerId).subscribe(response => {
      expect(response.data).toEqual([MOCK_SALES_PLAN]);
      expect(response.usedMock).toBeTrue();
    });

    const req = httpMock.expectOne(`${baseUrl}/sales-plans/seller/${mockPlan.sellerId}`);
    expect(req.request.method).toBe('GET');
    req.error(new ErrorEvent('Network error'));
  });
});
