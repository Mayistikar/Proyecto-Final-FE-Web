import { Component} from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import { CommonModule} from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';


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

  manufacturerForm = new FormGroup({
    manufacturerName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    companyName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    companyAddress: new FormControl('', [Validators.required, Validators.minLength(3)]),
    companyCountry: new FormControl(''),
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
    console.warn(this.manufacturerForm.value);
  }
}
