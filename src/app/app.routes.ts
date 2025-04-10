import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ManufacturerComponent } from './manufacturer/manufacturer.component';
import { SellerRegisterComponent } from './seller/seller-register/seller-register.component';
import { SellerDashboardComponent } from './seller/seller-dashboard/seller-dashboard.component';
import { ManufacturerDashboardComponent } from './manufacturer/manufacturer-dashboard/manufacturer-dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { CreateProductComponent } from './manufacturer/create-product/create-product.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'manufacturer', component: ManufacturerComponent },
  { path: 'seller-register', component: SellerRegisterComponent },
  { path: 'seller-dashboard', component: SellerDashboardComponent, canActivate: [AuthGuard] },
  { path: 'manufacturer-dashboard', component: ManufacturerDashboardComponent, canActivate: [AuthGuard] },
  { path: 'manufacturer/create-product', component: CreateProductComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
