// manufacturer-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-manufacturer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './manufacturer-dashboard.component.html',
  styleUrls: ['./manufacturer-dashboard.component.scss']
})
export class ManufacturerDashboardComponent implements OnInit {
  manufacturerName: string = 'Anderson';
  products: { name: string, description: string }[] = [
    { name: 'PRODUCT_1_NAME', description: 'PRODUCT_1_DESC' },
    { name: 'PRODUCT_2_NAME', description: 'PRODUCT_2_DESC' },
    { name: 'PRODUCT_3_NAME', description: 'PRODUCT_3_DESC' }
  ];

  constructor() {}

  ngOnInit(): void {
    // Simulated product list; in real case, fetch from backend
  }
}

