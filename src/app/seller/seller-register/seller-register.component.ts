// seller-register.component.ts
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { SellerService } from '../seller.service';
import { Seller } from '../seller.model';

@Component({
  selector: 'app-seller-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './seller-register.component.html',
  styleUrls: ['./seller-register.component.scss']
})

export class SellerRegisterComponent {
  coverageZoneGroups = [
    { label: 'COVERAGE_COLOMBIA', zones: ['ZONE_BOGOTA', 'ZONE_MEDELLIN', 'ZONE_CALI', 'ZONE_BARRANQUILLA'] },
    { label: 'COVERAGE_USA', zones: ['ZONE_NEW_YORK', 'ZONE_CALIFORNIA', 'ZONE_TEXAS', 'ZONE_FLORIDA'] }
  ];

  sellerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.minLength(10)]),
    address: new FormControl('', [Validators.required, Validators.minLength(3)]),
    zone: new FormControl('', [Validators.required]),
    specialty: new FormControl(''),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(
    private router: Router,
    private sellerService: SellerService,
  ) {}

  get name() { return this.sellerForm.get('name')!; }
  get email() { return this.sellerForm.get('email')!; }
  get phone() { return this.sellerForm.get('phone')!; }
  get address() { return this.sellerForm.get('address')!; }
  get zone() { return this.sellerForm.get('zone')!; }
  get specialty() { return this.sellerForm.get('specialty')!; }
  get password() { return this.sellerForm.get('password')!; }
  get confirmPassword() { return this.sellerForm.get('confirmPassword')!; }

  get passwordsMatch(): boolean {
    const password = this.password.value;
    const confirmPassword = this.confirmPassword.value;
    const match = password === confirmPassword;
    if (!match) {
      this.confirmPassword.setErrors({ passwordsDoNotMatch: true });
    }
    return match;
  }

  getZoneGroups() {
    return this.coverageZoneGroups;
  }

  onSubmit(): void {
    if (this.sellerForm.valid && this.passwordsMatch) {
      const { name, email, phone, address, zone, specialty, password } = this.sellerForm.getRawValue();

      const seller = new Seller(
        '',
        name ?? '',
        email ?? '',
        phone ?? '',
        address ?? '',
        zone ?? '',
        specialty ?? '',
        password ?? ''
      );

      this.sellerService.register(seller).subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err: any) => console.error('Registration error', err)
      });
    }
  }
}
