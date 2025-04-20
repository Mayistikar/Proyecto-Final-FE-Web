// seller-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';
import { SalesPlanService } from '../services/sales-plan.service';
import { SalesPlan } from '../../models/sales-plan.model';
import { catchError, of } from 'rxjs';
import { MOCK_SALES_PLAN } from '../mocks/mock-sales-plan';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.scss']
})
export class SellerDashboardComponent implements OnInit {
  sellerName: string = '';
  salesPlans: SalesPlan[] = [];
  loading = false;
  usedMock = false;

  constructor(
    private authService: AuthService,
    private salesPlanService: SalesPlanService,
    private router: Router,
    private toastr: ToastrService, 
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const seller = this.authService.getUserData();

    if (!seller || seller.role !== 'seller') {
      this.router.navigate(['/']);
      return;
    }

    this.sellerName = seller.email.split('@')[0];

    this.salesPlanService.getSalesPlansBySeller(seller.id).pipe(
      catchError((error) => {
        console.warn('❗ No se pudieron cargar los planes de venta:', error);
        this.translate.get('SALES_PLAN.LOAD_ERROR').subscribe(msg => this.toastr.error(msg));
        this.salesPlans = [MOCK_SALES_PLAN];
        this.usedMock = true;
        this.loading = false;
        return of([]);
      })
    ).subscribe((plans) => {
      if (!plans || plans.length === 0) {
        console.warn('🔍 No se encontraron planes, usando mock temporal.');
        this.salesPlans = [MOCK_SALES_PLAN];
        this.usedMock = true;
      } else {
        this.salesPlans = plans;
        this.usedMock = false;
      }
      this.loading = false;
    });
  }

  viewSalesPlanDetail(planId: string): void {
    this.router.navigate([`/seller/sales-plan-detail/${planId}`]);
  }
 
  createSalesPlan(): void {
    this.router.navigate(['/seller/sales-plans/create']);
  }
}