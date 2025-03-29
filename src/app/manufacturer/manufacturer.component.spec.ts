import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManufacturerComponent } from './manufacturer.component';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

describe('ManufacturerComponent', () => {
  let component: ManufacturerComponent;
  let fixture: ComponentFixture<ManufacturerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ManufacturerComponent,
        TranslateModule.forRoot(),
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
        },
        Router,
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManufacturerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
