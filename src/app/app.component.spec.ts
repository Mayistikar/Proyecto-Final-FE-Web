import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        TranslateService,
        TranslateStore
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'proyecto-final-web' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('proyecto-final-web');
  });

  it('should change language to Spanish', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    spyOn(app.getTranslateService(), 'use');
    app.changeLanguage('es');
    expect(app.getTranslateService().use).toHaveBeenCalledWith('es');
  });

  it('should change language to English', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    spyOn(app.getTranslateService(), 'use');
    app.changeLanguage('en');
    expect(app.getTranslateService().use).toHaveBeenCalledWith('en');
  });

  it('should have default language as English', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.getTranslateService().getDefaultLang()).toEqual('en');
  });

  it('should add English and Spanish as available languages', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.getTranslateService().getLangs()).toEqual(['en', 'es']);
  });
});
