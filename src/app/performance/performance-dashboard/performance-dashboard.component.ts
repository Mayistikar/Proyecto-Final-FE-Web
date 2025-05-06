import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { Observable, of, combineLatest } from 'rxjs';
import { debounceTime, finalize, first, map, startWith } from 'rxjs/operators';

import { PerformanceReportService } from '../performance-report.service';
import { SellerService } from '../../seller/seller.service';
import { AuthService } from '../../auth/auth.service';

import { Seller } from '../../seller/seller.model';
import { PerformanceKpi } from '../../models/performance-report.model';
import { UserData } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-performance-dashboard',
  templateUrl: './performance-dashboard.component.html',
  styleUrls: ['./performance-dashboard.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceDashboardComponent implements OnInit {
  sellers = signal<Seller[]>([]);
  kpis = signal<PerformanceKpi[]>([]);
  summaryKpi = signal<PerformanceKpi | null>(null);
  loading = signal(false);
  loadErr = signal(false);
  sellersLoading = signal(false);
  sellersErr = signal(false);
  adminName = signal<string>('');

  selectedSeller: Seller | null = null;
  dropdownOpen = false;
  readonly skeletonRows = Array.from({ length: 6 });
  get isLoading() { return this.loading(); }

  private fb = inject(FormBuilder);
  private kpiSvc = inject(PerformanceReportService);
  private sellerSvc = inject(SellerService);
  private auth = inject(AuthService);

  sellerNameControl = new FormControl<string>('');
  filterForm = this.fb.group({
    sellerId: [''],
    period: ['month']
  });
  filteredSellers$: Observable<Seller[]> = of([]);

  ngOnInit(): void {
    this.fetchSellers();
    this.loadKpis();
    this.loadAdminName();
    this.watchFormChanges();
    this.watchSellerAutocomplete();
  }

  private loadAdminName(): void {
    const user: UserData | null = this.auth.getUser();
    const name = user?.email?.split('@')[0] ?? '';
    this.adminName.set(name);
  }

  private watchFormChanges(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(200))
      .subscribe(() => this.loadKpis());
  }

  private watchSellerAutocomplete(): void {
    this.filteredSellers$ = this.sellerNameControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      map((value) => this.filterSellerNames(value ?? ''))
    );
  }

  private fetchSellers(): void {
    this.sellersLoading.set(true);
    this.sellersErr.set(false);

    this.sellerSvc.getAll()
      .pipe(first(), finalize(() => this.sellersLoading.set(false)))
      .subscribe({
        next: (list) => this.sellers.set(list),
        error: () => this.sellersErr.set(true)
      });
  }

  private loadKpis(): void {
    const { sellerId, period } = this.filterForm.value;
    const [start, end] = this.calcRange(period ?? 'month');

    this.loading.set(true);
    this.loadErr.set(false);

    if (sellerId) {
      this.kpiSvc.getBySeller(sellerId, start, end)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (kpi) => {
            const seller = this.sellers().find(s => s.id === sellerId) ?? null;
            const kpiList = kpi ? [kpi] : [this.emptyRow(seller)];
            this.selectedSeller = seller;
            this.kpis.set(kpiList);
            this.summaryKpi.set(kpi ?? this.emptyRow(seller));
          },
          error: () => {
            this.loadErr.set(true);
            this.kpis.set([]);
            this.summaryKpi.set(null);
          }
        });

    } else {
      this.selectedSeller = null;
      combineLatest([
        this.sellerSvc.getAll(),
        this.kpiSvc.getAll(start, end)
      ])
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: ([sellers, kpis]) => {
            const mapKpi = new Map(kpis.map(k => [k.sellerId, k]));
            const merged = sellers.map(s => mapKpi.get(s.id) ?? this.emptyRow(s));
            merged.sort((a, b) => b.totalSales - a.totalSales);
            this.kpis.set(merged);
            this.summaryKpi.set(this.buildSummary(merged));
          },
          error: () => {
            this.loadErr.set(true);
            this.kpis.set([]);
            this.summaryKpi.set(null);
          }
        });
    }
  }

  private buildSummary(kpis: PerformanceKpi[]): PerformanceKpi {
    return kpis.reduce<PerformanceKpi>(
      (acc, cur) => ({
        sellerId: 'SUMMARY',
        sellerName: 'Resumen',
        clientCount: acc.clientCount + cur.clientCount,
        totalSales: acc.totalSales + cur.totalSales,
        monthlySales: acc.monthlySales + cur.monthlySales,
        quarterlySales: acc.quarterlySales + cur.quarterlySales,
        currency: cur.currency || acc.currency
      }),
      {
        sellerId: 'SUMMARY',
        sellerName: 'Resumen',
        clientCount: 0,
        totalSales: 0,
        monthlySales: 0,
        quarterlySales: 0,
        currency: 'usd'
      }
    );
  }

  private emptyRow(s: Seller | null): PerformanceKpi {
    return {
      sellerId: s?.id ?? '—',
      sellerName: s?.name ?? '—',
      clientCount: 0,
      totalSales: 0,
      monthlySales: 0,
      quarterlySales: 0,
      currency: 'usd'
    };
  }

  private calcRange(period: string): [string, string] {
    const now = new Date();
    if (period === 'quarter') {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return [start.toISOString(), now.toISOString()];
    }
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return [start.toISOString(), now.toISOString()];
  }

  private filterSellerNames(value: string): Seller[] {
    return this.sellers().filter(s =>
      s.name.toLowerCase().includes(value.toLowerCase())
    );
  }

  @HostListener('document:click', ['$event'])
  closeOnClickOutside(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    if (!target.closest('.seller-dropdown')) {
      this.dropdownOpen = false;
    }
  }

  @HostListener('keydown.escape')
  closeOnEsc() {
    this.dropdownOpen = false;
  }

  onSellerInputChange(ev: Event): void {
    const value = (ev.target as HTMLInputElement).value;
    const sel = this.sellers().find(s => s.name === value);
    this.filterForm.patchValue({ sellerId: sel?.id || '' });
    this.selectedSeller = sel ?? null;
    this.dropdownOpen = true;
  }

  selectSeller(sel: Seller): void {
    this.sellerNameControl.setValue(sel.name, { emitEvent: true });
    this.filterForm.patchValue({ sellerId: sel.id });
    this.selectedSeller = sel;
    this.dropdownOpen = false;
  }

  get cards() {
    const s = this.summaryKpi();
    if (!s) return [];
    return [
      { title: 'CARD_CLIENTS', value: { amount: s.clientCount.toString(), currency: '' } },
      { title: 'CARD_TOTAL_SALES', value: this.asFormattedMoney(s.totalSales, s.currency) },
      { title: 'CARD_MONTH_SALES', value: this.asFormattedMoney(s.monthlySales, s.currency) },
      { title: 'CARD_QUARTER_SALES', value: this.asFormattedMoney(s.quarterlySales, s.currency) }
    ];
  }

  public asFormattedMoney(amount: number, cur = 'usd') {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur.toUpperCase(),
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const symbol = formatter.formatToParts(0).find(p => p.type === 'currency')?.value ?? '$';
    const formatted = formatter.format(amount);

    return {
      amount: `${symbol}${formatted.replace(symbol, '').trim()}`,
      currency: cur.toUpperCase()
    };
  }

  isSelectedSeller(s: Seller): boolean {
    return this.filterForm.value.sellerId === s.id;
  }

  trackById(_: number, k: PerformanceKpi) {
    return k.sellerId;
  }


  getPerformanceLabel(sales: number): string {
    if (sales >= 10000) return 'PERFORMANCE_STATUS_GOOD';
    if (sales >= 5000) return 'PERFORMANCE_STATUS_AVERAGE';
    return 'PERFORMANCE_STATUS_LOW';
  }
  
  getPerformanceIcon(sales: number): string {
    if (sales >= 10000) return 'bi bi-check-circle text-success'; 
    if (sales >= 5000) return 'bi bi-exclamation-circle text-warning';
    return 'bi bi-x-circle text-danger'; 
  }
}
