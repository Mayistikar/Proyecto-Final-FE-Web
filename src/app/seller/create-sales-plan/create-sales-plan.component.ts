
//src/app/seller/create-sales-plan/create-sales-plan.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidationErrors  } from '@angular/forms';
import { Router } from '@angular/router';
import { SalesPlanService } from '../services/sales-plan.service';
import { SalesPlan } from '../../models/sales-plan.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { routesByZone, zoneToCountryMap } from '../../models/sales-plan-routes';

@Component({
  selector: 'app-create-sales-plan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './create-sales-plan.component.html',
  styleUrls: ['./create-sales-plan.component.scss']
})
export class CreateSalesPlanComponent implements OnInit {
  salesPlanForm!: FormGroup;
  isLoading = false;
  availableRoutes: string[] = [];
  sellerZone = '';
  sellerCountry = '';

  strategies: string[] = ['DIRECT_PROMOTION', 'FREE_SAMPLES', 'BULK_DISCOUNT'];
  events: string[] = ['LOCAL_CONCERT', 'REGIONAL_FAIR', 'SPORT_EVENT'];

  constructor(
    private fb: FormBuilder,
    private salesPlanService: SalesPlanService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUserData();

    if (!user || user.role !== 'seller' || !user.zone) {
      this.router.navigate(['/login']);
      return;
    }

    this.sellerZone = user.zone;
    this.sellerCountry = zoneToCountryMap[this.sellerZone];
    this.availableRoutes = routesByZone[this.sellerZone] || [];

    this.salesPlanForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      visitRoute: ['', Validators.required],
      dailyGoal: ['', [Validators.required, Validators.min(1)]],
      weeklyGoal: ['', [Validators.required, Validators.min(1)]],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      strategy: ['', Validators.required],
      event: ['', Validators.required]
    },
    { validators: this.validateTimeRange }
  );
  }

  validateTimeRange(group: FormGroup): ValidationErrors | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;

    if (!start || !end) return null;

    return start < end ? null : { invalidTimeRange: true };
  }

  onSubmit(): void {
    if (this.salesPlanForm.invalid) {
      this.salesPlanForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const sellerId = this.authService.getUserId();

    if (!sellerId) {
      this.router.navigate(['/login']);
      return;
    }

    const salesPlan: SalesPlan = {
      ...this.salesPlanForm.value,
      sellerId,
      createdAt: new Date().toISOString()
    };

    this.salesPlanService.create(salesPlan).subscribe({
      next: () => {
        this.translate.get('SALES_PLAN.CREATED_SUCCESS').subscribe(msg => this.toastr.success(msg));
        this.router.navigate(['/seller-dashboard']);
      },
      error: () => {
        this.translate.get('SALES_PLAN.CREATED_ERROR').subscribe(msg => this.toastr.error(msg));
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/seller-dashboard']);
  }
}