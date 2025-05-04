//performance-report.service.spec.ts

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { PerformanceReportService } from './performance-report.service';
import { PerformanceKpi }           from '../models/performance-report.model';

const API_BASE   = 'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api';
const ENDPOINT   = `${API_BASE}/reports`;

const backendStub = [
  {
    seller_id  : 's-1',
    seller_name: 'Alice',
    clients    : 10,
    sells      : 1500,
    month_sells: 400,
    quarterly  : 1200,
    currency   : 'USD'
  },
  {
    seller_id  : 's-2',
    seller_name: 'Bob',
    clients    : 5,
    sells      :  900,
    month_sells: 200,
    quarterly  :  700,
    currency   : 'USD'
  }
];

describe('PerformanceReportService', () => {
  let service : PerformanceReportService;
  let httpCtl : HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PerformanceReportService]
    });

    service = TestBed.inject(PerformanceReportService);
    httpCtl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpCtl.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getAll', () => {
    it('maps backend report → PerformanceKpi[]', () => {
      let result: PerformanceKpi[] | undefined;

      service.getAll().subscribe(r => (result = r));

      const req = httpCtl.expectOne(ENDPOINT);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0); // sin filtros

      req.flush(backendStub);

      expect(result!.length).toBe(2);
      expect(result![0]).toEqual(
        jasmine.objectContaining({
          sellerId      : 's-1',
          sellerName    : 'Alice',
          clientCount   : 10,
          totalSales    : 1500,
          monthlySales  : 400,
          quarterlySales: 1200,
          currency      : 'USD'
        })
      );
    });

    it('adds start / end params when provided', () => {
      const start = '2025-01-01';
      const end   = '2025-01-31';

      service.getAll(start, end).subscribe();
      const req = httpCtl.expectOne(
        r =>
          r.url === ENDPOINT &&
          r.params.get('startDate') === start &&
          r.params.get('endDate') === end
      );
      req.flush([]);
    });
  });

  describe('#getBySeller', () => {
    it('returns KPI for given sellerId', () => {
      let result: PerformanceKpi | null | undefined;

      service.getBySeller('s-2').subscribe(r => (result = r));

      const req = httpCtl.expectOne(ENDPOINT);
      req.flush(backendStub);

      expect(result!.sellerId).toBe('s-2');
      expect(result!.sellerName).toBe('Bob');
    });

    it('returns null if seller not present', () => {
      let result: PerformanceKpi | null | undefined;

      service.getBySeller('unknown').subscribe(r => (result = r));

      httpCtl.expectOne(ENDPOINT).flush(backendStub);

      expect(result).toBeNull();
    });
  });

  describe('#getSummary', () => {
    it('aggregates totals correctly', () => {
      let summary: PerformanceKpi | undefined;

      service.getSummary().subscribe(r => (summary = r));

      httpCtl.expectOne(ENDPOINT).flush(backendStub);

      expect(summary).toEqual(
        jasmine.objectContaining({
          sellerId      : 'GLOBAL',
          clientCount   : 15,
          totalSales    : 2400,
          monthlySales  : 600,
          quarterlySales: 1900,
          currency      : 'USD'
        })
      );
    });
  });

  it('uses accumulated currency if current item currency is empty', () => {
    let summary: PerformanceKpi | undefined;
  
    const stubWithEmptyCurrency = [
      {
        seller_id  : 's-1',
        seller_name: 'Alice',
        clients    : 10,
        sells      : 1500,
        month_sells: 400,
        quarterly  : 1200,
        currency   : 'USD'
      },
      {
        seller_id  : 's-2',
        seller_name: 'Bob',
        clients    : 5,
        sells      : 900,
        month_sells: 200,
        quarterly  : 700,
        currency   : '' // << vacío aquí
      }
    ];
  
    service.getSummary().subscribe(r => (summary = r));
  
    httpCtl.expectOne(ENDPOINT).flush(stubWithEmptyCurrency);
  
    expect(summary).toEqual(
      jasmine.objectContaining({
        sellerId      : 'GLOBAL',
        clientCount   : 15,
        totalSales    : 2400,
        monthlySales  : 600,
        quarterlySales: 1900,
        currency      : 'USD' // ← debe conservar el del primero
      })
    );
  });
  
  
});
