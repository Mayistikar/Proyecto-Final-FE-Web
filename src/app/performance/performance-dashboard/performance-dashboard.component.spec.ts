import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError, firstValueFrom } from 'rxjs';
import { faker } from '@faker-js/faker';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PerformanceDashboardComponent } from './performance-dashboard.component';
import { PerformanceReportService } from '../performance-report.service';
import { SellerService } from '../../seller/seller.service';
import { Seller } from '../../seller/seller.model';
import { PerformanceKpi } from '../../models/performance-report.model';

function buildSeller(): Seller {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    zone: faker.location.city(),
    specialty: faker.word.adjective(),
    password: faker.internet.password()
  } as Seller;
}

function buildKpi(seller: Seller): PerformanceKpi {
  return {
    sellerId: seller.id,
    sellerName: seller.name,
    clientCount: faker.number.int({ min: 5, max: 40 }),
    totalSales: faker.number.int({ min: 1000, max: 10000 }),
    monthlySales: faker.number.int({ min: 100, max: 3000 }),
    quarterlySales: faker.number.int({ min: 400, max: 9000 }),
    currency: 'USD'
  };
}

const kpiSvcSpy = jasmine.createSpyObj<PerformanceReportService>('PerformanceReportService', [
  'getAll',
  'getBySeller'
]);

const sellerSvcSpy = jasmine.createSpyObj<SellerService>('SellerService', ['getAll']);

let component: PerformanceDashboardComponent;
let fixture: ComponentFixture<PerformanceDashboardComponent>;

const sellers: Seller[] = Array.from({ length: 3 }, buildSeller);
const kpis: PerformanceKpi[] = sellers.map(buildKpi);
const summary: PerformanceKpi = {
  sellerId: 'SUMMARY',
  sellerName: 'Resumen',
  clientCount: kpis.reduce((a, k) => a + k.clientCount, 0),
  totalSales: kpis.reduce((a, k) => a + k.totalSales, 0),
  monthlySales: kpis.reduce((a, k) => a + k.monthlySales, 0),
  quarterlySales: kpis.reduce((a, k) => a + k.quarterlySales, 0),
  currency: 'USD'
};

describe('PerformanceDashboardComponent', () => {
  beforeEach(async () => {
    sellerSvcSpy.getAll.and.returnValue(of(sellers));
    kpiSvcSpy.getAll.and.returnValue(of(kpis));
    kpiSvcSpy.getBySeller.and.callFake((id: string) => of(kpis.find(k => k.sellerId === id)!));

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        PerformanceDashboardComponent
      ],
      providers: [
        { provide: PerformanceReportService, useValue: kpiSvcSpy },
        { provide: SellerService, useValue: sellerSvcSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerformanceDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('fetches sellers on init', () => {
    expect(sellerSvcSpy.getAll).toHaveBeenCalled();
    expect(component.sellers().length).toBe(3);
    expect(component.sellersErr()).toBeFalse();
  });

  it('loads global KPIs on init', () => {
    expect(kpiSvcSpy.getAll).toHaveBeenCalled();
    expect(component.kpis().length).toBe(3);
    expect(component.summaryKpi()).toEqual(summary);
  });

  it('calls getBySeller when a seller is selected', fakeAsync(() => {
    const target = sellers[1];
    component.selectSeller(target);
    tick(250);
    expect(kpiSvcSpy.getBySeller).toHaveBeenCalledWith(
      target.id,
      jasmine.any(String),
      jasmine.any(String)
    );
    expect(component.kpis()[0].sellerId).toBe(target.id);
  }));

  it('sets error flags when services fail', fakeAsync(() => {
    sellerSvcSpy.getAll.and.returnValue(throwError(() => new Error('fail')));
    component['fetchSellers']();
    tick();
    expect(component.sellersErr()).toBeTrue();

    kpiSvcSpy.getAll.and.returnValue(throwError(() => new Error('boom')));
    component['loadKpis']();
    tick();
    expect(component.loadErr()).toBeTrue();
  }));

  it('filters seller names reactively', fakeAsync(async () => {
    const partial = sellers[0].name.slice(0, 2);
    component.sellerNameControl.setValue(partial);
    tick(250);
    const list = await firstValueFrom(component.filteredSellers$);
    expect(list.some(s => s.id === sellers[0].id)).toBeTrue();
  }));


  it('onSellerInputChange fills sellerId and opens dropdown', () => {
    const ev = { target: { value: sellers[0].name } } as unknown as Event;
    component.onSellerInputChange(ev);
    expect(component.filterForm.value.sellerId).toBe(sellers[0].id);
    expect(component.dropdownOpen).toBeTrue();
  });

  it('onSellerInputChange clears sellerId if not found', () => {
    const ev = { target: { value: 'NoMatch' } } as unknown as Event;
    component.onSellerInputChange(ev);
    expect(component.filterForm.value.sellerId).toBe('');
    expect(component.dropdownOpen).toBeTrue();
  });

  it('closeOnClickOutside respects dropdown', () => {
    const inside = document.createElement('div');
    inside.classList.add('seller-dropdown');
    component.dropdownOpen = true;
    component.closeOnClickOutside({ target: inside } as unknown as MouseEvent);
    expect(component.dropdownOpen).toBeTrue();
  
    const outside = document.createElement('div');
    component.closeOnClickOutside({ target: outside } as unknown as MouseEvent);
    expect(component.dropdownOpen).toBeFalse();
  });

  it('closeOnEsc closes dropdown', () => {
    component.dropdownOpen = true;
    component.closeOnEsc();
    expect(component.dropdownOpen).toBeFalse();
  });


  it('isSelectedSeller detects match', () => {
    component.filterForm.patchValue({ sellerId: sellers[2].id });
    expect(component.isSelectedSeller(sellers[2])).toBeTrue();
    expect(component.isSelectedSeller(sellers[0])).toBeFalse();
  });

  it('emptyRow returns defaults if null', () => {
    const result = (component as any).emptyRow(null);
    expect(result.sellerId).toBe('—');
    expect(result.sellerName).toBe('—');
  });

  it('emptyRow returns seller info if provided', () => {
    const result = (component as any).emptyRow(sellers[0]);
    expect(result.sellerId).toBe(sellers[0].id);
  });

  it('filterSellerNames matches names', () => {
    const result = (component as any).filterSellerNames(
      sellers[0].name.slice(1, 4).toUpperCase()
    );
    expect(result.some((s: Seller) => s.id === sellers[0].id)).toBeTrue();
  });

  it('cards returns empty array if summaryKpi is null', () => {
    spyOn(component, 'summaryKpi').and.returnValue(null);
    expect(component.cards).toEqual([]);
  });

  it('calcRange handles "month" and "quarter"', () => {
    const resultMonth = (component as any).calcRange('month');
    const resultQuarter = (component as any).calcRange('quarter');
    expect(resultMonth[0]).toContain('T');
    expect(resultQuarter[0]).toContain('T');
  });

  it('calcRange defaults to month on unknown input', () => {
    const [start, end] = (component as any).calcRange('unexpected');
    expect(start).toContain('T');
    expect(end).toContain('T');
  });


  describe('loadKpis() with sellerId', () => {
    it('sets KPI and summaryKpi when KPI exists', fakeAsync(() => {
      const seller = sellers[0];
      component.filterForm.patchValue({ sellerId: seller.id, period: 'month' });
  
      kpiSvcSpy.getBySeller.and.returnValue(of(kpis[0]));
  
      component['loadKpis']();
      tick();
  
      expect(component.kpis()[0].sellerId).toBe(seller.id);
      expect(component.summaryKpi()!.sellerId).toBe(seller.id);
      expect(component.loadErr()).toBeFalse();
    }));
  
    it('sets emptyRow when KPI is null', fakeAsync(() => {
      const seller = sellers[1];
      component.filterForm.patchValue({ sellerId: seller.id, period: 'month' });
    
      kpiSvcSpy.getBySeller.and.returnValue(of(null));
    
      const empty = {
        sellerId: '—',
        sellerName: '—',
        clientCount: 0,
        totalSales: 0,
        monthlySales: 0,
        quarterlySales: 0,
        currency: 'USD'
      };
      const emptySpy = spyOn(component as any, 'emptyRow').and.returnValue(empty);
    
      component['loadKpis']();
      tick();
    
      expect(emptySpy).toHaveBeenCalledWith(seller);
      expect(component.kpis()[0]).toEqual(empty);
      expect(component.summaryKpi()).toEqual(empty);
    }));
  
    it('handles error response gracefully', fakeAsync(() => {
      const seller = sellers[2];
      component.filterForm.patchValue({ sellerId: seller.id, period: 'month' });
  
      kpiSvcSpy.getBySeller.and.returnValue(throwError(() => new Error('fail')));
  
      const loadErrSpy = spyOn(component['loadErr'], 'set').and.callThrough();
      const kpisSpy = spyOn(component['kpis'], 'set').and.callThrough();
      const summarySpy = spyOn(component['summaryKpi'], 'set').and.callThrough();
  
      component['loadKpis']();
      tick();
  
      expect(loadErrSpy).toHaveBeenCalledWith(true);
      expect(kpisSpy).toHaveBeenCalledWith([]);
      expect(summarySpy).toHaveBeenCalledWith(null);
    }));
  });

  describe('#getPerformanceLabel', () => {
    it('returns GOOD when sales >= 10000', () => {
      expect(component.getPerformanceLabel(12000)).toBe('PERFORMANCE_STATUS_GOOD');
    });

    it('returns AVERAGE when sales >= 5000 and < 10000', () => {
      expect(component.getPerformanceLabel(6000)).toBe('PERFORMANCE_STATUS_AVERAGE');
    });

    it('returns LOW when sales < 5000', () => {
      expect(component.getPerformanceLabel(3000)).toBe('PERFORMANCE_STATUS_LOW');
    });
  });

  describe('#getPerformanceIcon', () => {
    it('returns success icon when sales >= 10000', () => {
      expect(component.getPerformanceIcon(15000)).toBe('bi bi-check-circle text-success');
    });

    it('returns warning icon when sales >= 5000 and < 10000', () => {
      expect(component.getPerformanceIcon(6000)).toBe('bi bi-exclamation-circle text-warning');
    });

    it('returns danger icon when sales < 5000', () => {
      expect(component.getPerformanceIcon(1000)).toBe('bi bi-x-circle text-danger');
    });
  });


  it('sets seller as null if not found in seller list', fakeAsync(() => {
    const ghostId = 'ghost-id';
    const ghostKpi: PerformanceKpi = {
      sellerId: ghostId,
      sellerName: 'Ghost Seller',
      clientCount: 0,
      totalSales: 0,
      monthlySales: 0,
      quarterlySales: 0,
      currency: 'USD'
    };
  
    kpiSvcSpy.getBySeller.and.returnValue(of(ghostKpi));
    spyOn(component, 'sellers').and.returnValue([]);
  
    component.selectSeller({ id: ghostId, name: 'Ghost Seller' } as Seller);
    tick(250);
  
    expect(component.selectedSeller).toBeNull();
  }));


  it('buildSummary() should fallback to acc.currency if cur.currency is undefined', () => {
    const componentAny = component as any;
  
    const kpiWithUndefinedCurrency: PerformanceKpi = {
      sellerId: 's1',
      sellerName: 'Vendedor A',
      clientCount: 10,
      totalSales: 1000,
      monthlySales: 500,
      quarterlySales: 800,
      currency: undefined as any
    };
  
    const initialKpi: PerformanceKpi = {
      sellerId: 's2',
      sellerName: 'Vendedor B',
      clientCount: 5,
      totalSales: 500,
      monthlySales: 300,
      quarterlySales: 400,
      currency: 'USD'
    };
  
    const summary = componentAny.buildSummary([initialKpi, kpiWithUndefinedCurrency]);
  
    expect(summary.currency).toBe('USD');
  });

  it('asFormattedMoney() should default to USD and format with $ symbol', () => {
    const result = component.asFormattedMoney(1234.56);
    expect(result.amount).toBe('$1,234.56');
    expect(result.currency).toBe('USD');
  });

  it('asFormattedMoney() should format amount with EUR symbol and uppercase code', () => {
    const result = component.asFormattedMoney(789.1, 'eur');
    expect(result.amount).toContain('€');
    expect(result.currency).toBe('EUR');
  });

  it('asFormattedMoney() should extract $ symbol correctly for USD', () => {
    const result = component.asFormattedMoney(1000, 'usd');
    expect(result.amount.startsWith('$')).toBeTrue();
    expect(result.amount).toBe('$1,000.00');
  });

  it('asFormattedMoney() should use $ when currency is USD and symbol is found', () => {
    const result = component.asFormattedMoney(1234.56, 'usd');
  
    expect(result.amount).toBe('$1,234.56');
    expect(result.currency).toBe('USD');
  });

  it('asFormattedMoney() should fallback to "$" when currency symbol is not found', () => {
    const mockFormatter = {
      formatToParts: () => [{ type: 'integer', value: '1234' }],
      format: () => '1234.56'
    };
    spyOn(Intl, 'NumberFormat').and.returnValue(mockFormatter as any);
  
    const result = component.asFormattedMoney(1234.56, 'usd');
  
    expect(result.amount).toBe('$1234.56');
    expect(result.currency).toBe('USD');
  });

  it('builds merged list with emptyRow when KPI is missing', () => {
    const seller = buildSeller(); 
    const kpiWithMatch = buildKpi(seller);
    const otherSeller = buildSeller(); 
  
    const sellerList = [seller, otherSeller];
    const kpiList = [kpiWithMatch];
  
    const emptyRowSpy = spyOn(component as any, 'emptyRow').and.callThrough();
  
    spyOn(component, 'sellers').and.returnValue(sellerList);
    (component as any).kpis.set(kpiList);
  
    const mapKpi = new Map(kpiList.map(k => [k.sellerId, k]));
    const merged = sellerList.map(s => mapKpi.get(s.id) ?? (component as any).emptyRow(s));
  
    expect(emptyRowSpy).toHaveBeenCalledWith(otherSeller);
    expect(merged.length).toBe(2);
    const fallbackKpi = merged.find(k => k.sellerId === otherSeller.id);
    expect(fallbackKpi).toBeTruthy();
    expect(fallbackKpi?.sellerName).toBe(otherSeller.name);
    expect(emptyRowSpy).toHaveBeenCalledWith(otherSeller);
  });
});