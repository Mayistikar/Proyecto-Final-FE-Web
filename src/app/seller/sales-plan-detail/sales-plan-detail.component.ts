import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SalesPlanService } from '../services/sales-plan.service';
import { SalesPlan } from '../../models/sales-plan.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sales-plan-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './sales-plan-detail.component.html',
  styleUrls: ['./sales-plan-detail.component.scss']
})
export class SalesPlanDetailComponent implements OnInit {
  salesPlan!: SalesPlan;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private salesPlanService: SalesPlanService,
    private router: Router,
    private translate: TranslateService,
    private toastr: ToastrService
    
  ) {}

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('id');

    if (!planId) {
      this.handleLoadError();
      return;
    }

    this.salesPlanService.getById(planId).subscribe({
      next: (plan: any) => {
        if (!plan) {
          this.handleLoadError();
          return;
        }

        this.salesPlan = {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          visitRoute: plan.visit_route,
          strategy: plan.strategy,
          event: plan.event,
          dailyGoal: plan.daily_goal,
          weeklyGoal: plan.weekly_goal,
          startTime: plan.start_time,
          endTime: plan.end_time,
          sellerId: plan.seller_id,
          createdAt: plan.created_at
        };

        this.loading = false;
        this.toastr.success(
          this.translate.instant('SALES_PLAN.LOAD_SUCCESS'),
          this.translate.instant('COMMON.SUCCESS'),
          { timeOut: 3000 }
        );
      },
      error: () => {
        this.handleLoadError();
      }
    });
  }

  private handleLoadError(): void {
    this.error = true;
    this.loading = false;
    this.toastr.error(
      this.translate.instant('SALES_PLAN.LOAD_ERROR'),
      this.translate.instant('COMMON.ERROR'),
      { timeOut: 4000 }
    );
  }

  editPlan(): void {
    this.router.navigate([`/seller/edit-sales-plan/${this.salesPlan.id}`]);
  }

  onCancel(): void {
    this.router.navigate(['/seller-dashboard']);
  }
}
