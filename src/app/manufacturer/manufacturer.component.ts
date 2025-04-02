import { Component} from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink, Router } from '@angular/router';
import { CommonModule} from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ManufacturerService } from './manufacturer.service';

@Component({
  selector: 'app-manufacturer',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './manufacturer.component.html',
  styleUrl: './manufacturer.component.css'
})
export class ManufacturerComponent {
  successMessageVisible = false;
  errorMessageVisible = false;

  constructor(
    private manufacturerService: ManufacturerService,
    private router: Router,
    private translate: TranslateService
  ) {}

  manufacturerForm = new FormGroup({
    manufacturerName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    companyName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    companyAddress: new FormControl('', [Validators.required, Validators.minLength(3)]),
    companyCountry: new FormControl('', [Validators.required]),
    manufacturerEmail: new FormControl('', [Validators.required, Validators.email]),
    manufacturerPhone: new FormControl('', [Validators.required, Validators.minLength(10), Validators.pattern('^\\+?[0-9]*$')]),
    manufacturerRUC: new FormControl('', [Validators.required, Validators.minLength(13), Validators.pattern('^[0-9]*$')]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  get manufacturerName() {
    return this.manufacturerForm.get('manufacturerName')!;
  }

  get companyName() {
    return this.manufacturerForm.get('companyName')!;
  }

  get companyAddress() {
    return this.manufacturerForm.get('companyAddress')!;
  }

  get companyCountry() {
    return this.manufacturerForm.get('companyCountry')!;
  }

  get manufacturerEmail() {
    return this.manufacturerForm.get('manufacturerEmail')!;
  }

  get manufacturerPhone() {
    return this.manufacturerForm.get('manufacturerPhone')!;
  }

  get manufacturerRUC() {
    return this.manufacturerForm.get('manufacturerRUC')!;
  }

  get password() {
    return this.manufacturerForm.get('password')!;
  }

  get confirmPassword() {
    return this.manufacturerForm.get('confirmPassword')!;
  }

  get passwordsMatch() {
    if (this.manufacturerForm.get('password')!.value === this.manufacturerForm.get('confirmPassword')!.value) {
      return true;
    }
    this.manufacturerForm.get('confirmPassword')!.setErrors({passwordsDoNotMatch: true});
    return false;
  }

  onSubmit() {
    console.log('Submit button clicked');
  
    if (!this.manufacturerForm.valid || !this.passwordsMatch) {
      console.warn('Form is invalid');
      console.table(this.manufacturerForm.value);
      return;
    }
  
    const form = this.manufacturerForm.value;
  
    const payload = {
      email: this.manufacturerEmail.value,
      password: this.password.value,
      confirm_password: this.confirmPassword.value,
      representative_name: this.manufacturerName.value,
      company_name: this.companyName.value,
      company_address: this.companyAddress.value,
      phone: this.manufacturerPhone.value,
      operation_country: this.companyCountry.value,
      tax_id: this.manufacturerRUC.value || null
    };
  
    console.log('Payload to send:', payload);
  
    this.manufacturerService.register(payload).subscribe({
      next: () => {
        this.successMessageVisible = true;

        setTimeout(() => {
          this.router.navigate(['/'], {
            state: {
              pendingValidation: true,
              userType: 'manufacturer',
              email: payload.email
            }
          });
        }, 3500);
      },
      error: () => {
        this.errorMessageVisible = true;
        setTimeout(() => this.errorMessageVisible = false, 5000);
      }
    });
  }
}