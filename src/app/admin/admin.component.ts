import { Component } from '@angular/core';
import { TranslatePipe } from "@ngx-translate/core";
import { AuthService } from '../auth/auth.service';
import { Manufacturer } from '../auth/user.interface';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  imports: [
    TranslatePipe,
    NgForOf,
    NgIf,
    NgClass,
    FormsModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})

export class AdminComponent {
  userName: string = '';
  unauthorizedUsers: any[] = [];
  successMessageVisible = false;
  errorMessageVisible = false;
  searchTerm: string = '';
  isLoading = true;
  skeletonRows = Array.from({ length: 5 });

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserData()?.email || '';
    this.authService.getUsers().subscribe({
      next: (data) => {
        this.unauthorizedUsers = data.users
                  .filter((user: Manufacturer) => (user.role === 'manufacturer' || user.role === 'seller'))
                  .sort((a, b) => Number(a.authorized) - Number(b.authorized));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.isLoading = false;
      }
    });
  }

  get filteredUsers(): any[] {
    return this.unauthorizedUsers.filter(user =>
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  authorize(user: Manufacturer): void {
    this.authService.authorizeUser(user).subscribe({
      next: () => {
        user.authorized = true;
        this.unauthorizedUsers = this.unauthorizedUsers.filter((u) => u);
        this.successMessageVisible = true;
      },
      error: (error) => {
        this.errorMessageVisible = true;
      }
    });
  }

  closeSuccessMessage(): void {
    this.successMessageVisible = false;
  }

  closeErrorMessage(): void {
    this.errorMessageVisible = false;
  }
}
