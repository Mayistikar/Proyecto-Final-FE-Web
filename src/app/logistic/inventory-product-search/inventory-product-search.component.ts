import { Component, OnInit } from '@angular/core';
import { InventoryProductService } from '../services/inventory-product.service';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-inventory-product-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './inventory-product-search.component.html',
  styleUrls: ['./inventory-product-search.component.css']
})
export class InventoryProductSearchComponent implements OnInit {
  productos: Product[] = [];
  productosFiltrados: Product[] = [];

  searchTerm: string = '';

  constructor(private inventoryProductService: InventoryProductService) {}

  ngOnInit(): void {
    this.inventoryProductService.getProducts().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = [...data];
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  filtrar(): void {
    const termino = this.searchTerm.trim().toLowerCase();
    this.productosFiltrados = this.productos.filter(producto => {
      const name = producto.name?.toLowerCase() ?? '';
      const id = producto.id?.toString().toLowerCase() ?? '';
      return name.includes(termino) || id.includes(termino);
    });
  }
  

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.productosFiltrados = [...this.productos];
  }
}




