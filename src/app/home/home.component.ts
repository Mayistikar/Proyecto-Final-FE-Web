import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService, UserData } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'home',
  imports: [MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TranslatePipe,
    RouterLink,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class HomeComponent {
  loginForm: FormGroup;
  pendingValidation: boolean = false;
  userType: string | null = null;
  email: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder,
              public router: Router,
              public authService: AuthService,
              public http: HttpClient,
              private cdr: ChangeDetectorRef) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      contrasena: ['', [Validators.required, Validators.minLength(4)]]
    });

    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { pendingValidation?: boolean; userType?: string; email?: string };

    if (state?.pendingValidation) {
      this.pendingValidation = true;
      this.userType = state.userType || null;
      this.email = state.email || null;

      setTimeout(() => {
        this.pendingValidation = false;
      }, 3000);
    }
  }

  async onSubmit() {
    this.isLoading = true;
    this.cdr.detectChanges();

    if (this.loginForm.valid) {
      const { usuario, contrasena } = this.loginForm.value;

      const loginData = {
        email: usuario,
        password: contrasena
      };

      try {
        const response: any = await lastValueFrom(this.http.post('https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/auth/login', loginData, {
          headers: { 'Content-Type': 'application/json' }
        }));

        const data: any = await lastValueFrom(this.http.get('https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/auth/users'))
        console.log({ data })

        const user: any = data?.users.find((usr: any) => usr.email === response.email);
        console.log({ user })

        this.authService.login({
          id: response.id,
          email: response.email,
          role: response.role,
          idToken: response.id_token,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          country: user?.profile?.operation_country,
          sector_coverage: user?.profile?.sector_coverage
        });

        this.isLoading = false;
        this.cdr.detectChanges();

        if (response.role === 'manufacturer') {
          this.router.navigate(['/manufacturer-dashboard']);
        } else if (response.role === 'seller') {
          this.router.navigate(['/seller-dashboard']);
        } else if (response.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      } catch (error: any) {
        if (error?.error?.error === 'Usuario no encontrado') {
          this.errorMessage = 'Invalid credentials';
        } else if (error.status === 401) {
          this.pendingValidation = true;
        } else if (error.status === 403) {
          this.pendingValidation = true;
          this.email = this.loginForm.get('usuario')?.value;
        } else if (error.status === 422) {
          this.pendingValidation = true;
          this.errorMessage = 'Invalid credentials';
          this.loginForm.get('usuario')?.setErrors({ invalid: true });
        } else if (error.status === 500) {
          this.errorMessage = 'Server error';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    } else {
      this.loginForm.markAllAsTouched();
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
