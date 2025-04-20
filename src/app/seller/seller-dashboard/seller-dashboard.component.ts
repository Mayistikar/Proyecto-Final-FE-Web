// seller-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';
import { SalesPlanService } from '../services/sales-plan.service';
import { SalesPlan } from '../../models/sales-plan.model';
import { catchError, of } from 'rxjs';
import { MOCK_SALES_PLAN } from '../mocks/mock-sales-plan';

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

  constructor(
    private authService: AuthService,
    private salesPlanService: SalesPlanService,
    private router: Router
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
        // fallback visual si el backend falla
        this.salesPlans = [MOCK_SALES_PLAN];
        this.loading = false;
        return of([]);
      })
    ).subscribe((plans) => {
      if (!plans || plans.length === 0) {
        console.warn('🔍 No se encontraron planes, usando mock temporal.');
        this.salesPlans = [MOCK_SALES_PLAN];
      } else {
        this.salesPlans = plans;
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