// seller-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';
import { SalesPlanService } from '../services/sales-plan.service';
import { SalesPlan } from '../../models/sales-plan.model';
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
  loadError = false; 

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

    this.salesPlanService.getSalesPlansBySeller(seller.id).subscribe({
      next: (plans) => {
        this.salesPlans = plans;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando planes de venta:', error);
        this.loading = false;
        this.loadError = true; 
        this.translate.get('SALES_PLAN.LOAD_ERROR').subscribe(msg => this.toastr.error(msg));
      }
    });
  }

  viewSalesPlanDetail(planId: string): void {
    this.router.navigate([`/seller/sales-plan-detail/${planId}`]);
  }

  createSalesPlan(): void {
    this.router.navigate(['/seller/sales-plans/create']);
  }
}
