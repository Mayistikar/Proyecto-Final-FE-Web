import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface UserData {
  id: string;
  email: string;
  role: string;
  idToken: string;
  accessToken: string;
  refreshToken: string;
  full_name:string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(private router: Router) {}

  login(userData?: UserData) {
    if (userData) {
      localStorage.setItem('user_id', userData.id);
      localStorage.setItem('user_email', userData.email);
      localStorage.setItem('user_role', userData.role);
      localStorage.setItem('id_token', userData.idToken);
      localStorage.setItem('access_token', userData.accessToken);
      localStorage.setItem('refresh_token', userData.refreshToken);
      localStorage.setItem('full_name',userData.full_name);
    }

    this._isAuthenticated.next(true);
  }

  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('full_name')

    this._isAuthenticated.next(false);
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return this._isAuthenticated.value;
  }

  get isAuthenticated() {
    return this._isAuthenticated.asObservable();
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  getUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getIdToken(): string | null {
    return localStorage.getItem('id_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }


  getUserFullName(): string | null {
    return localStorage.getItem('user_full_name');
  }
  
  getUserData(): UserData | null {
    const id = this.getUserId();
    const email = this.getUserEmail();
    const role = this.getUserRole();
    const idToken = this.getIdToken();
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const full_name =  this.getUserFullName();

    if (id && email && role && idToken && accessToken && refreshToken && full_name) {
      return { id, email, role, idToken, accessToken, refreshToken, full_name };
    }

    return null;
  }

  getCurrentManufacturer(): { id: string; email: string; role: string; companyName?: string } | null {
    const id = this.getUserId();
    const email = this.getUserEmail();
    const role = this.getUserRole();
  
    if (id && email && role === 'manufacturer') {
      return {
        id,
        email,
        role,
        companyName: email.split('@')[0]  // Simple fallback: usar parte del correo
      };
    }
  
    return null;
  }
}
