import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManufacturerDashboardComponent } from './manufacturer-dashboard.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService, TranslateStore } from '@ngx-translate/core';

describe('ManufacturerDashboardComponent', () => {
  let component: ManufacturerDashboardComponent;
  let fixture: ComponentFixture<ManufacturerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ManufacturerDashboardComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ],
      providers: [
        TranslateService,
        TranslateStore
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManufacturerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a manufacturer name defined', () => {
    expect(component.manufacturerName).toBe('Anderson');
  });

  it('should contain 3 products initially', () => {
    expect(component.products.length).toBe(3);
  });

  it('should contain specific product keys', () => {
    expect(component.products[0].name).toBe('PRODUCT_1_NAME');
    expect(component.products[1].description).toBe('PRODUCT_2_DESC');
  });
});
