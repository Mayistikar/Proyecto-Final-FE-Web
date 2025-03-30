import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      providers: [
        TranslateService,
        TranslateStore,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}), // Mock params observable
            snapshot: { paramMap: { get: () => 'test-id' } } // Mock snapshot
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log user and password when form is valid', () => {
    spyOn(console, 'log');
    component.loginForm.setValue({ usuario: 'testuser', contrasena: 'testpass' });
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Usuario:', 'testuser', 'Contraseña:', 'testpass');
  });

  it('should log "Formulario inválido" when form is invalid', () => {
    spyOn(console, 'log');
    component.loginForm.setValue({ usuario: '', contrasena: '' });
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Formulario inválido');
  });

  it('should log "Formulario inválido" when password is too short', () => {
    spyOn(console, 'log');
    component.loginForm.setValue({ usuario: 'testuser', contrasena: '123' });
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Formulario inválido');
  });
});
