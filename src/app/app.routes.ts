import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ManufacturerComponent } from './manufacturer/manufacturer.component';
import { SellerRegisterComponent } from './seller/seller-register/seller-register.component';
import { SellerDashboardComponent } from './seller/seller-dashboard/seller-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'manufacturer', component: ManufacturerComponent },
  { path: 'seller-register', component: SellerRegisterComponent },
  { path: 'seller-dashboard', component: SellerDashboardComponent },
];
