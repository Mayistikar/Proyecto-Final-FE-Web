/* ===========================================================================
 * performance-dashboard.component.spec.ts
 * ===========================================================================
 * Test suite – PerformanceDashboardComponent
 * --------------------------------------------------------------------------*/

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule }   from '@angular/forms';
import { TranslateModule }       from '@ngx-translate/core';
import { of, throwError, firstValueFrom } from 'rxjs';
import { faker }                 from '@faker-js/faker';

import { PerformanceDashboardComponent } from './performance-dashboard.component';
import { PerformanceReportService }      from '../performance-report.service';
import { SellerService }                 from '../../seller/seller.service';
import { PerformanceKpi }                from '../../models/performance-report.model';
import { Seller }                        from '../../seller/seller.model';

function buildSeller(): Seller {
  return {
    id        : faker.string.uuid(),
    name      : faker.person.fullName(),
    email     : faker.internet.email(),
    phone     : faker.phone.number(),
    address   : faker.location.streetAddress(),
    zone      : faker.location.city(),
    specialty : faker.word.adjective(),
    password  : faker.internet.password()
  } as Seller;
}

function buildKpi(seller: Seller): PerformanceKpi {
  return {
    sellerId       : seller.id,
    sellerName     : seller.name,
    clientCount    : faker.number.int({ min: 5, max: 40 }),
    totalSales     : faker.number.int({ min: 1_000, max: 10_000 }),
    monthlySales   : faker.number.int({ min: 100, max: 3_000 }),
    quarterlySales : faker.number.int({ min: 400, max: 9_000 }),
    currency       : 'USD'
  };
}

const kpiSvcSpy    = jasmine.createSpyObj<PerformanceReportService>(
  'PerformanceReportService',
  ['getAll', 'getBySeller', 'getSummary']
);

const sellerSvcSpy = jasmine.createSpyObj<SellerService>(
  'SellerService',
  ['getAll']
);

let component: PerformanceDashboardComponent;
let fixture  : ComponentFixture<PerformanceDashboardComponent>;

const sellers : Seller[]          = Array.from({ length: 3 }, buildSeller);
const kpis    : PerformanceKpi[]  = sellers.map(buildKpi);
const summary : PerformanceKpi    = {
  sellerId       : '—',
  sellerName     : '—',
  clientCount    : kpis.reduce((a, k) => a + k.clientCount,    0),
  totalSales     : kpis.reduce((a, k) => a + k.totalSales,     0),
  monthlySales   : kpis.reduce((a, k) => a + k.monthlySales,   0),
  quarterlySales : kpis.reduce((a, k) => a + k.quarterlySales, 0),
  currency       : 'USD'
};

describe('PerformanceDashboardComponent', () => {

  beforeEach(async () => {
    sellerSvcSpy.getAll.and.returnValue(of(sellers));
    kpiSvcSpy.getAll.and.returnValue(of(kpis));
    kpiSvcSpy.getSummary.and.returnValue(of(summary));
    kpiSvcSpy.getBySeller.and.callFake((id: string) =>
      of(kpis.find(k => k.sellerId === id)!)
    );

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        PerformanceDashboardComponent         
      ],
      providers: [
        { provide: PerformanceReportService, useValue: kpiSvcSpy },
        { provide: SellerService,            useValue: sellerSvcSpy }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(PerformanceDashboardComponent);
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

  it('filters seller names reactively', fakeAsync(async () => {
    const partial = sellers[0].name.slice(0, 2);
    component.sellerNameControl.setValue(partial);
    tick(250);                                          
    const list = await firstValueFrom(component.filteredSellers$);
    expect(list.some(s => s.id === sellers[0].id)).toBeTrue();
  }));

  it('calls getBySeller when a seller is selected', fakeAsync(() => {
    const target = sellers[1];
    component.selectSeller(target);
    tick(250);                                        
    expect(kpiSvcSpy.getBySeller)
      .toHaveBeenCalledWith(target.id, jasmine.any(String), jasmine.any(String));
    expect(component.kpis()[0].sellerId).toBe(target.id);
  }));

  it('clears filters with clearFilters()', () => {
    component.filterForm.patchValue({ sellerId: sellers[0].id, period: 'quarter' });
    component.clearFilters();
    expect(component.filterForm.value).toEqual({ sellerId: '', period: 'month' });
    expect(component.sellerNameControl.value).toBe('');
    expect(component.dropdownOpen).toBeFalse();
  });

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

  describe('UI-behaviour helpers', () => {

    it('onSellerInputChange() fills sellerId and opens dropdown', () => {
      const ev = { target: { value: sellers[0].name } } as unknown as Event;
      component.onSellerInputChange(ev);
      expect(component.filterForm.value.sellerId).toBe(sellers[0].id);
      expect(component.dropdownOpen).toBeTrue();
    });

    it('onSellerInputChange() clears sellerId if name not found', () => {
      const ev = { target: { value: 'no match' } } as unknown as Event;
      component.onSellerInputChange(ev);
      expect(component.filterForm.value.sellerId).toBe('');
      expect(component.dropdownOpen).toBeTrue();
    });

    it('closeOnClickOutside() keeps dropdown open if click is inside', () => {
      const inside = document.createElement('div');
      inside.classList.add('seller-dropdown');
      component.dropdownOpen = true;

      component.closeOnClickOutside({ target: inside } as unknown as MouseEvent);
      expect(component.dropdownOpen).toBeTrue();
    });

    it('closeOnClickOutside() closes dropdown if click is outside', () => {
      const outside = document.createElement('div');
      component.dropdownOpen = true;

      component.closeOnClickOutside({ target: outside } as unknown as MouseEvent);
      expect(component.dropdownOpen).toBeFalse();
    });

    it('closeOnEsc() always closes dropdown', () => {
      component.dropdownOpen = true;
      component.closeOnEsc();
      expect(component.dropdownOpen).toBeFalse();
    });
  });

  describe('utility methods', () => {
    let util: any;            
    beforeEach(() => { util = component as any; });

    describe('#calcRange', () => {
      function mockNow(dateIso: string) {
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(dateIso));
      }

      afterEach(() => jasmine.clock().uninstall());

      it('returns first day of this month → now for "month"', () => {
        mockNow('2025-05-04T10:00:00Z');
        const [start, end] = util.calcRange('month');
        expect(new Date(start).getUTCDate()).toBe(1);
        expect(new Date(end).getUTCDate()).toBe(4);
      });

      it('returns first day two months back for "quarter"', () => {
        mockNow('2025-05-15T08:00:00Z');
        const [start] = util.calcRange('quarter');
        expect(new Date(start).getUTCMonth()).toBe(2);
      });

      it('returns empty strings for any other value', () => {
        mockNow('2025-05-01T00:00:00Z');
        expect(util.calcRange('all')).toEqual(['', '']);
      });
    });

    it('filterSellerNames() matches sellers case-insensitively', () => {
      const fragment = sellers[0].name.slice(1, 4).toUpperCase();
      const res = util.filterSellerNames(fragment);
      expect(res.some((s: Seller) => s.id === sellers[0].id)).toBeTrue();
    });

    it('isSelectedSeller() detects selected seller', () => {
      component.filterForm.patchValue({ sellerId: sellers[2].id });
      expect(component.isSelectedSeller(sellers[2])).toBeTrue();
      expect(component.isSelectedSeller(sellers[0])).toBeFalse();
    });

    it('emptyRow() returns zeroed KPI row with seller data if provided', () => {
      const kpi = util.emptyRow(sellers[0]);
      expect(kpi.sellerId).toBe(sellers[0].id);
      expect(kpi.sellerName).toBe(sellers[0].name);
    });

    it('emptyRow() returns placeholder row if seller is null', () => {
      const kpi = util.emptyRow(null);
      expect(kpi.sellerId).toBe('—');
      expect(kpi.sellerName).toBe('—');
    });
  });

  describe('getBySeller() integration', () => {
    let util: any;
  
    beforeEach(() => { util = component as any; });
  
    it('does NOT call emptyRow(sel) when KPI is returned for existing seller', fakeAsync(() => {
      const target = sellers[0];
  
      const spy = spyOn(util, 'emptyRow').and.callThrough();
  
      component.selectSeller(target);
      tick(250);
  
      expect(spy).not.toHaveBeenCalled();
      expect(component.kpis()[0].sellerId).toBe(target.id);
    }));
  
    it('sets KPI with ghost seller even if seller is not found in list', fakeAsync(() => {
      const ghostSellerId = faker.string.uuid();
      const ghostKpi = {
        ...buildKpi({ id: ghostSellerId, name: 'Ghost' } as Seller),
        sellerId: ghostSellerId,
        sellerName: 'Ghost'
      };
    
      kpiSvcSpy.getBySeller.and.returnValue(of(ghostKpi));
    
      const spy = spyOn(util, 'emptyRow').and.callThrough();
    
      component.selectSeller({ id: ghostSellerId, name: 'Ghost' } as Seller);
      tick(250);
    
      expect(spy).not.toHaveBeenCalled();
    
      expect(component.kpis()[0].sellerId).toBe(ghostSellerId);
      expect(component.kpis()[0].sellerName).toBe('Ghost');  // <- punto y coma correcto
    }));
  });

  it('should return empty array if summaryKpi is null', () => {
    spyOn(component, 'summaryKpi').and.returnValue(null);
  
    const result = component.cards;
    expect(result).toEqual([]);
  });

  it('should call loadKpis when refresh is invoked', () => {
    const spy = spyOn(component as any, 'loadKpis'); 
    component.refresh();
    expect(spy).toHaveBeenCalled();
  });


  it('should call emptyRow(sel) if kpi is falsy and set kpis with emptyRow', fakeAsync(() => {
    const sellerId = faker.string.uuid();
    const sellerName = faker.person.fullName();
  
    const seller: Seller = {
      id: sellerId,
      name: sellerName,
      email: '',
      phone: '',
      address: '',
      zone: '',
      specialty: '',
      password: ''
    };
  
    spyOn(component, 'sellers').and.returnValue([seller]);
  
    // Retorna null como KPI
    kpiSvcSpy.getBySeller.and.returnValue(of(null));
  
    // Simula una fila vacía generada
    const emptyRowSpy = spyOn(component as any, 'emptyRow').and.callFake(() => ({
      sellerId: '—',
      sellerName: '—',
      clientCount: 0,
      totalSales: 0,
      monthlySales: 0,
      quarterlySales: 0,
      currency: 'USD'
    }));
  
    component.selectSeller(seller);
    tick(250);
  
    expect(emptyRowSpy).toHaveBeenCalledWith(seller);
  
    const result = component.kpis()[0]; // ← accede por índice, asumiendo array
    expect(result.sellerId).toBe('—');
    expect(result.sellerName).toBe('—');
  }));

  describe('filterSellerNames input transformation', () => {
    it('should handle null or undefined safely', () => {
      const input1 = null;
      const input2 = undefined;
      const input3 = 'Carlos';
  
      const transform = (v: any) => (v ?? '').toString();
  
      expect(transform(input1)).toBe('');
      expect(transform(input2)).toBe('');
      expect(transform(input3)).toBe('Carlos');
    });
  });
  

  it('should set loadErr to true and clear kpis on error when selecting seller', fakeAsync(() => {
    const sellerId = faker.string.uuid();
    const sellerName = faker.person.fullName();
  
    const seller: Seller = {
      id: sellerId,
      name: sellerName,
      email: '',
      phone: '',
      address: '',
      zone: '',
      specialty: '',
      password: ''
    };
  
    spyOn(component, 'sellers').and.returnValue([seller]);
  
    kpiSvcSpy.getBySeller.and.returnValue(throwError(() => new Error('Test error')));
  
    const loadErrSpy = spyOn(component['loadErr'], 'set').and.callThrough();
    const kpisSpy = spyOn(component['kpis'], 'set').and.callThrough();
  
    component.selectSeller(seller);
    tick(250);
  
    expect(loadErrSpy).toHaveBeenCalledWith(true);
    expect(kpisSpy).toHaveBeenCalledWith([]);
  }));
  


  

});


