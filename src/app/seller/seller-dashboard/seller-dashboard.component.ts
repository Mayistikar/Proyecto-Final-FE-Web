// seller-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.scss']
})
export class SellerDashboardComponent implements OnInit {
  sellerName: string = 'Anderson';
  salesPlans: { name: string, description: string }[] = [
    { name: 'STARTER_PLAN_NAME', description: 'STARTER_PLAN_DESC' },
    { name: 'GROWTH_PLAN_NAME', description: 'GROWTH_PLAN_DESC' },
    { name: 'PRO_PLAN_NAME', description: 'PRO_PLAN_DESC' }
  ];

  constructor() {}

  ngOnInit(): void {
    // Simulated dashboard; in real case, fetch from backend
  }
}