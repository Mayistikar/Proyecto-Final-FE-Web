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
  
    const mockPlan: SalesPlan = new SalesPlan(
      faker.string.uuid(),
      faker.string.uuid(), // sellerId
      faker.commerce.productName(), // name
      faker.lorem.sentence(), // description
      faker.number.int({ min: 5, max: 20 }), // dailyGoal
      faker.number.int({ min: 30, max: 100 }), // weeklyGoal
      '08:00',
      '17:00',
      'ROUTE_BOGOTA_NORTE',
      faker.lorem.words(3), // strategy
      faker.lorem.words(2), // event
      faker.date.recent().toISOString() // createdAt
    );
  
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
        expect(response).toEqual(mockPlans);
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
      const updated = new SalesPlan(
        mockPlan.id,
        mockPlan.sellerId,
        'Plan Actualizado',
        mockPlan.description,
        mockPlan.dailyGoal,
        mockPlan.weeklyGoal,
        mockPlan.startTime,
        mockPlan.endTime,
        mockPlan.visitRoute,
        mockPlan.strategy,
        mockPlan.event,
        mockPlan.createdAt
      );
  
      service.update(mockPlan.id, updated).subscribe(response => {
        expect(response).toEqual(updated);
      });
  
      const req = httpMock.expectOne(`${baseUrl}/sales-plans/${mockPlan.id}`);
      expect(req.request.method).toBe('PUT');
      req.flush(updated);
    });


    it('should return MOCK_SALES_PLAN if id is "mock-id"', () => {
      service.getById('mock-id').subscribe(response => {
        expect(response).toEqual(MOCK_SALES_PLAN);
      });

      httpMock.expectNone(`${baseUrl}/sales-plans/mock-id`);
    });
  

  });