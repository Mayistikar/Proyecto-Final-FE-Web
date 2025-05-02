import { TestBed } from '@angular/core/testing';

import { PerformanceReportService } from './performance-report.service';

describe('PerformanceReportService', () => {
  let service: PerformanceReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformanceReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
