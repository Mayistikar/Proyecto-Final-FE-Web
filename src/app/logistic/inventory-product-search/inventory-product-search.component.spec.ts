import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryProductSearchComponent } from './inventory-product-search.component';

describe('InventoryProductSearchComponent', () => {
  let component: InventoryProductSearchComponent;
  let fixture: ComponentFixture<InventoryProductSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryProductSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryProductSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
