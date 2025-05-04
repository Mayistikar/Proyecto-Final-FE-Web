//performance-dashboard.component.ts

import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule }       from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl
} from '@angular/forms';
import { TranslateModule }    from '@ngx-translate/core';

import { Observable, of, combineLatest } from 'rxjs';
import {
  debounceTime,
  finalize,
  first,
  map,
  startWith
} from 'rxjs/operators';

import { PerformanceReportService } from '../performance-report.service';
import { SellerService }            from '../../seller/seller.service';
import { Seller }                   from '../../seller/seller.model';
import { PerformanceKpi }           from '../../models/performance-report.model';

@Component({
  standalone  : true,
  selector    : 'app-performance-dashboard',
  templateUrl : './performance-dashboard.component.html',
  styleUrls   : ['./performance-dashboard.component.scss'],
  imports     : [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceDashboardComponent implements OnInit {

  readonly skeletonRows = Array.from({ length: 6 });
  get isLoading() { return this.loading(); }

  private fb        = inject(FormBuilder);
  private kpiSvc    = inject(PerformanceReportService);
  private sellerSvc = inject(SellerService);

  sellers        = signal<Seller[]>([]);
  sellersLoading = signal(false);
  sellersErr     = signal(false);

  kpis       = signal<PerformanceKpi[]>([]);
  summaryKpi = signal<PerformanceKpi | null>(null);
  loading    = signal(false);
  loadErr    = signal(false);

  sellerNameControl = new FormControl<string>('');
  filteredSellers$: Observable<Seller[]> = of([]);

  filterForm = this.fb.group({
    sellerId: [''],
    period  : ['month']
  });

  dropdownOpen = false;

  ngOnInit(): void {
    this.fetchSellers();
    this.loadKpis();

    this.filterForm.valueChanges
        .pipe(debounceTime(200))
        .subscribe(() => this.loadKpis());

    this.filteredSellers$ = this.sellerNameControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      map(v => this.filterSellerNames((v ?? '').toString()))
    );
  }

  refresh(): void {
    this.loadKpis();
  }

  clearFilters(): void {
    this.filterForm.reset({ sellerId: '', period: 'month' });
    this.sellerNameControl.reset('');
    this.dropdownOpen = false;
  }

  onSellerInputChange(ev: Event): void {
    const value = (ev.target as HTMLInputElement).value;
    const sel = this.sellers().find(s => s.name === value);
    this.filterForm.patchValue({ sellerId: sel?.id || '' });
    this.dropdownOpen = true;
  }

  selectSeller(sel: Seller): void {
    this.sellerNameControl.setValue(sel.name, { emitEvent: true });
    this.filterForm.patchValue({ sellerId: sel.id });
    this.dropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  closeOnClickOutside(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    if (!target.closest('.seller-dropdown')) {
      this.dropdownOpen = false;
    }
  }

  @HostListener('keydown.escape')
  closeOnEsc() { this.dropdownOpen = false; }

  private fetchSellers(): void {
    this.sellersLoading.set(true);
    this.sellersErr.set(false);

    this.sellerSvc.getAll()
      .pipe(first(), finalize(() => this.sellersLoading.set(false)))
      .subscribe({
        next : list => this.sellers.set(list),
        error: ()   => this.sellersErr.set(true)
      });
  }

  private loadKpis(): void {
    const { sellerId, period } = this.filterForm.value;
    const [start, end]         = this.calcRange(period!);

    this.loading.set(true);
    this.loadErr.set(false);

    if (sellerId) {
      this.kpiSvc.getBySeller(sellerId, start, end)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next : kpi => {
            const sel = this.sellers().find(s => s.id === sellerId) ?? null;
            this.kpis.set(kpi ? [kpi] : [this.emptyRow(sel)]);
          },
          error: () => { this.loadErr.set(true); this.kpis.set([]); }
        });

      this.kpiSvc.getSummary(start, end)
                 .subscribe(sum => this.summaryKpi.set(sum));
      return;
    }

    combineLatest([
      this.sellerSvc.getAll(),
      this.kpiSvc.getAll(start, end)
    ])
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe({
      next : ([sellers, kpis]) => {
        const mapK = new Map(kpis.map(k => [k.sellerId, k]));
        this.kpis.set(
          sellers.map(s => mapK.get(s.id) ?? this.emptyRow(s))
        );
      },
      error: () => { this.loadErr.set(true); this.kpis.set([]); }
    });

    this.kpiSvc.getSummary(start, end)
               .subscribe(sum => this.summaryKpi.set(sum));
  }

  get cards() {
    const s = this.summaryKpi();
    if (!s) { return []; }
    return [
      { title: 'CARD_CLIENTS',       value: s.clientCount },
      { title: 'CARD_TOTAL_SALES',   value: this.asMoney(s.totalSales,   s.currency) },
      { title: 'CARD_MONTH_SALES',   value: this.asMoney(s.monthlySales, s.currency) },
      { title: 'CARD_QUARTER_SALES', value: this.asMoney(s.quarterlySales, s.currency) }
    ];
  }

  private asMoney(amount: number, cur = 'usd') {
    return new Intl.NumberFormat(undefined,
      { style: 'currency', currency: cur }).format(amount);
  }

  private emptyRow(s: Seller | null): PerformanceKpi {
    return {
      sellerId       : s?.id   ?? '—',
      sellerName     : s?.name ?? '—',
      clientCount    : 0,
      totalSales     : 0,
      monthlySales   : 0,
      quarterlySales : 0,
      currency       : 'usd'
    };
  }

  private calcRange(period: string): [string, string] {
    const now = new Date();
    if (period === 'quarter') {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return [start.toISOString(), now.toISOString()];
    }
    if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return [start.toISOString(), now.toISOString()];
    }
    return ['', ''];
  }

  private filterSellerNames(v: string): Seller[] {
    return this.sellers()
               .filter(s => s.name.toLowerCase().includes(v.toLowerCase()));
  }
  
  isSelectedSeller(s: Seller): boolean {
    return this.filterForm.value.sellerId === s.id;
  }

  trackById(_: number, k: PerformanceKpi) { return k.sellerId; }
}
