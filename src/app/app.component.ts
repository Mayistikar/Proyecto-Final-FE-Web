import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import {AuthService, UserData} from './auth/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    TranslateModule,
    FontAwesomeModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    RouterModule,
    NgIf
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'proyecto-final-web';
  user : any;
  userData: UserData | null = null;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private authService: AuthService,
  ) {
    translate.addLangs(['en', 'es']);
    translate.setDefaultLang('en');
    this.user = <string>localStorage.getItem('user_rol');
    console.log({ user: this.user });
  }

  ngOnInit() {
    this.authService.userData$.subscribe(data => {
      this.userData = data;
    });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  getTranslateService() {
    return this.translate;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goWarehouse() {
    this.router.navigate(['/warehouse']);
  }

  goAuthorization() {
    this.router.navigate(['/admin']);
  }

  logout() {
    this.authService.logout();
    this.userData = null;
    this.router.navigate(['/login'], { queryParams: { logout: true } });
  }
}
