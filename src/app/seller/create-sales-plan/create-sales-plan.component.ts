// src/app/seller/create-sales-plan/create-sales-plan.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { SalesPlanService } from '../services/sales-plan.service';
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
import { finalize, timer } from 'rxjs';

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
  availableRoutes: string[] = ['NORTH_ROUTE', 'SOUTH_ROUTE', 'EAST_ROUTE', 'WEST_ROUTE', 'DOWNTOWN', 'RURAL_AREA'];
  strategies = ['DIRECT_PROMOTION', 'FREE_SAMPLES', 'BULK_DISCOUNT'];
  events = ['LOCAL_CONCERT', 'REGIONAL_FAIR', 'SPORT_EVENT'];
  sellerZone = '';
  sellerCountry = '';


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
    if (!user || user.role !== 'seller') {
      this.router.navigate(['/login']);
      return;
    }

    this.sellerZone = user.zone || '';
    this.sellerCountry = zoneToCountryMap[this.sellerZone] || '';
    this.availableRoutes = routesByZone[this.sellerZone] || [];

    console.log('[CreatePlan] zone      →', this.sellerZone);
    console.log('[CreatePlan] routes    →', this.availableRoutes);

    this.salesPlanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      visitRoute: ['', [Validators.required]],
      dailyGoal: ['', [Validators.required, Validators.min(1)]],
      weeklyGoal: ['', [Validators.required, Validators.min(1)]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      strategy: ['', [Validators.required]],
      event: ['', [Validators.required]]
    }, { validators: this.validateTimeRange });
  }

  validateTimeRange(group: FormGroup): ValidationErrors | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
  
    if (!start || !end) return null;
  
    return start < end ? null : { invalidTimeRange: true };
  }

  fieldIsInvalid(field: string): boolean {
    const control = this.salesPlanForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private toSnakeCase(payload: any): any {
    return {
      name: payload.name,
      description: payload.description,
      visit_route: payload.visitRoute,
      daily_goal: payload.dailyGoal,
      weekly_goal: payload.weeklyGoal,
      start_time: payload.startTime,
      end_time: payload.endTime,
      strategy: payload.strategy,
      event: payload.event,
      seller_id: payload.sellerId,
      created_at: payload.createdAt
    };
  }

  onSubmit(): void {
    if (this.salesPlanForm.invalid) {
      this.salesPlanForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const sellerId = this.authService.getUserId();
    if (!sellerId) {
      this.translate.get('ERROR.SELLER_INVALID').subscribe(msg => this.toastr.error(msg));
      this.isLoading = false;
      return;
    }

    const formValue = this.salesPlanForm.value;
    const salesPlan = {
      ...formValue,
      sellerId,
      createdAt: new Date().toISOString()
    };

    const payload = this.toSnakeCase(salesPlan);

    console.log('Payload enviado al backend:', payload);

    this.salesPlanService.create(payload).pipe(
      finalize(() => (this.isLoading = false))   
    ).subscribe({
      next: () => {
        console.log('Plan de ventas creado correctamente');
    
        this.toastr.success(
          this.translate.instant('SALES_PLAN.CREATED_SUCCESS'),
          this.translate.instant('COMMON.SUCCESS'),
          { timeOut: 3000 }
        );
    
        setTimeout(() => this.router.navigate(['/seller-dashboard']), 1500);
      },
    
      error: (err) => {
        console.error('[CreatePlan] error →', err);
    
        this.toastr.error(
          this.translate.instant('SALES_PLAN.CREATED_ERROR'),
          this.translate.instant('COMMON.ERROR'),
          { timeOut: 3000 }
        );
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/seller-dashboard']);
  }
}
