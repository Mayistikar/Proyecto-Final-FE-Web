import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    TranslateModule,
    FontAwesomeModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterOutlet, 
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'proyecto-final-web';

  constructor(
    private translate: TranslateService,
    private router: Router // <--- Aquí lo agregas
  ) {
    translate.addLangs(['en', 'es']);
    translate.setDefaultLang('en');
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
}
