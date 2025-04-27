// src/app/seller/edit-sales-plan/edit-sales-plan.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesPlanService } from '../services/sales-plan.service';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { routesByZone, zoneToCountryMap } from '../../models/sales-plan-routes';

@Component({
  selector: 'app-edit-sales-plan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './edit-sales-plan.component.html',
  styleUrls: ['./edit-sales-plan.component.scss']
})
export class EditSalesPlanComponent implements OnInit {
  salesPlanForm!: FormGroup;
  loading = false;
  updating = false;
  salesPlanId!: string;
  initialSalesPlanData: any;
  availableRoutes: string[] = ['NORTH_ROUTE', 'SOUTH_ROUTE', 'EAST_ROUTE', 'WEST_ROUTE', 'DOWNTOWN', 'RURAL_AREA'];
  strategies = ['DIRECT_PROMOTION', 'FREE_SAMPLES', 'BULK_DISCOUNT'];
  events = ['LOCAL_CONCERT', 'REGIONAL_FAIR', 'SPORT_EVENT'];
  sellerZone = '';
  sellerCountry = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private salesPlanService: SalesPlanService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.salesPlanId = this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadSalesPlan();
  }

  initForm(): void {
    this.salesPlanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      visitRoute: ['', [Validators.required]],
      strategy: ['', [Validators.required]],
      event: ['', [Validators.required]],
      dailyGoal: ['', [Validators.required, Validators.min(1)]],
      weeklyGoal: ['', [Validators.required, Validators.min(1)]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]]
    }, { validators: this.validateTimeRange });
  }

  validateTimeRange(group: FormGroup): ValidationErrors | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    if (!start || !end) return null;
    return start < end ? null : { invalidTimeRange: true };
  }

  loadSalesPlan(): void {
    this.loading = true;
    this.salesPlanService.getById(this.salesPlanId).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (plan: any) => {
        if (!plan) {
          this.handleLoadError();
          return;
        }
        const normalized = {
          name: plan.name,
          description: plan.description,
          visitRoute: plan.visit_route,
          strategy: plan.strategy,
          event: plan.event,
          dailyGoal: plan.daily_goal,
          weeklyGoal: plan.weekly_goal,
          startTime: plan.start_time,
          endTime: plan.end_time
        };
        this.salesPlanForm.patchValue(normalized);
        this.initialSalesPlanData = normalized;

        const user = this.authService.getUserData();
        this.sellerZone = user?.zone || '';
        this.sellerCountry = zoneToCountryMap[this.sellerZone] || '';
      },
      error: () => this.handleLoadError()
    });
  }

  private handleLoadError(): void {
    this.toastr.error(
      this.translate.instant('SALES_PLAN.LOAD_ERROR'),
      this.translate.instant('COMMON.ERROR'),
      { timeOut: 4000 }
    );
    this.router.navigate(['/seller-dashboard']);
  }

  fieldIsInvalid(field: string): boolean {
    const control = this.salesPlanForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isFormChanged(): boolean {
    const current = this.salesPlanForm.getRawValue();
    return JSON.stringify(current) !== JSON.stringify(this.initialSalesPlanData);
  }

  private toSnakeCase(payload: any): any {
    return {
      name: payload.name,
      description: payload.description,
      visit_route: payload.visitRoute,
      strategy: payload.strategy,
      event: payload.event,
      daily_goal: payload.dailyGoal,
      weekly_goal: payload.weeklyGoal,
      start_time: payload.startTime,
      end_time: payload.endTime
    };
  }

  onSubmit(): void {
    if (this.salesPlanForm.invalid) {
      this.salesPlanForm.markAllAsTouched();
      this.toastr.error(
        this.translate.instant('FORM.INVALID'),
        this.translate.instant('COMMON.ERROR'),
        { timeOut: 3000 }
      );
      return;
    }

    if (!this.isFormChanged()) {
      console.info('No hay cambios para actualizar');
      this.toastr.info(
        this.translate.instant('FORM.NO_CHANGES'),
        this.translate.instant('COMMON.INFO'),
        { timeOut: 3000 }
      );
      return;
    }

    this.updating = true;
    const payload = this.toSnakeCase(this.salesPlanForm.value);

    this.salesPlanService.update(this.salesPlanId, payload).pipe(
      finalize(() => this.updating = false)
    ).subscribe({
      next: () => {
        console.log('Plan de venta actualizado exitosamente');
        this.toastr.success(
          this.translate.instant('SALES_PLAN.UPDATED_SUCCESS'),
          this.translate.instant('COMMON.SUCCESS'),
          { timeOut: 3000 }
        );
        setTimeout(() => {
          this.router.navigate(['/seller-dashboard']);
        }, 2000);
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('SALES_PLAN.UPDATED_ERROR'),
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
