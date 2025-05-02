//src/app/performance/performance-dashboard.component.ts
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PerformanceReportService } from '../performance-report.service';
import { SellerService } from '../../seller/seller.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Seller } from '../../seller/seller.model';
import { PerformanceKpi } from '../../models/performance-report.model';
import { first } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-performance-dashboard',
  templateUrl: './performance-dashboard.component.html',
  styleUrls: ['./performance-dashboard.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSelectModule,
    MatProgressSpinnerModule, 
    TranslateModule 
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceDashboardComponent implements OnInit {

  private fb        = inject(FormBuilder);
  private kpiSvc    = inject(PerformanceReportService);
  private sellerSvc = inject(SellerService);

  sellers        = signal<Seller[]>([]);
  sellersLoading = signal(false);
  sellersErr     = signal(false);

  kpis     = signal<PerformanceKpi[]>([]);
  loading  = signal(false);
  loadErr  = signal(false);


  filterForm = this.fb.group({
    sellerId: [''],
    period  : ['month']               
  });

  readonly displayedColumns = [
    'seller', 'clients', 'total', 'monthly', 'quarterly'
  ];

  ngOnInit(): void {
    this.fetchSellers();
    this.loadKpis();                                
    this.filterForm.valueChanges.subscribe(() => this.loadKpis());
  }

  refresh(): void {
    this.loadKpis();
  }

  private fetchSellers(): void {
    this.sellersLoading.set(true);
    this.sellersErr.set(false);
    this.sellerSvc.getAll().pipe(first()).subscribe({
      next: s => this.sellers.set(s),
      error: () => this.sellersErr.set(true),
      complete: () => this.sellersLoading.set(false)
    });
  }

  private loadKpis(): void {
    const { sellerId, period } = this.filterForm.value;
    const [start, end]         = this.calcRange(period!);

    this.loading.set(true);
    this.loadErr.set(false);

    const req$ = sellerId
      ? (period === 'quarter'
            ? this.kpiSvc.getSellerQuarterly(sellerId!, start, end)
            : this.kpiSvc.getSellerMonthly(sellerId!, start, end))
      : this.kpiSvc.getBySeller(start, end);

    req$.subscribe({
      next    : d => this.kpis.set(d),
      error   : () => this.loadErr.set(true),
      complete: () => this.loading.set(false)
    });
  }

  private calcRange(period: string): [string, string] {
    const now = new Date();
    if (period === 'quarter') {
      const qStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return [qStart.toISOString(), now.toISOString()];
    }
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return [mStart.toISOString(), now.toISOString()];
  }
}
