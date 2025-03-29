import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ManufacturerComponent } from './manufacturer/manufacturer.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'manufacturer', component: ManufacturerComponent }
];
