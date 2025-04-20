import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SalesPlanService } from '../services/sales-plan.service';
import { SalesPlan } from '../../models/sales-plan.model';

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
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('id');

    if (!planId) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.salesPlanService.getById(planId).subscribe({
      next: (plan) => {
        this.salesPlan = plan;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  editPlan(): void {
    this.router.navigate([`/seller/edit-sales-plan/${this.salesPlan.id}`]);
  }
}