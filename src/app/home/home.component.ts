import {ChangeDetectionStrategy, Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import { RouterLink, Router } from '@angular/router';



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
    RouterLink
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


  constructor(private fb: FormBuilder, private router: Router) {
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

  onSubmit() {
    if (this.loginForm.valid) {
      const { usuario, contrasena } = this.loginForm.value;
      console.log('Usuario:', usuario, 'Contraseña:', contrasena);
    } else {
      console.log('Formulario inválido');
    }
  }
}
