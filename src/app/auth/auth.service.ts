import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {Manufacturer, Users} from './user.interface';
import { HttpClient } from '@angular/common/http';

export interface UserData {
  id: string;
  email: string;
  role: string;
  zone?: string;
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(this.hasValidToken());
  private _userData = new BehaviorSubject<UserData | null>(this.getUserData());

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  login(userData?: any) {
    if (userData) {
      this._userData.next(userData || null);
      localStorage.setItem('user_id', userData.id);
      localStorage.setItem('user_email', userData.email);
      localStorage.setItem('user_role', userData.role);
      localStorage.setItem('user_country', userData.country);
      if (userData.zone) {
        localStorage.setItem('user_zone', userData.zone);
      }
      localStorage.setItem('id_token', userData.idToken);
      localStorage.setItem('access_token', userData.accessToken);
      localStorage.setItem('refresh_token', userData.refreshToken);
    }

    this._isAuthenticated.next(true);
  }

  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_zone');
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_country');

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

  getUserCountry(): string | null {
    return localStorage.getItem('user_country');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getUserZone(): string | undefined {
    return localStorage.getItem('user_zone') ?? undefined;
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

  getUserData(): UserData | null {
    const id = this.getUserId();
    const email = this.getUserEmail();
    const role = this.getUserRole();
    const zone = this.getUserZone();
    const idToken = this.getIdToken();
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (id && email && role && idToken && accessToken && refreshToken) {
      return { id, email, role, zone, idToken, accessToken, refreshToken };
    }

    return null;
  }

  get userData$() {
    return this._userData.asObservable();
  }

  getUser() {
    return this._userData.value;
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

  getUsers() {
    return this.http.get<Users>('https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/auth/users?role=manufacturer');
  }

  authorizeUser(user: Manufacturer) {
    return this.http.put(`https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/auth/manufacturer/${user.id}/authorize`, {});
  }
}


export class MockAuthService {
  private userData: UserData | null = null;

  login(userData: UserData): void {
    this.userData = userData;
  }

  logout(): void {
    this.userData = null;
  }

  isLoggedIn(): boolean {
    return this.userData !== null;
  }

  getUserData(): UserData | null {
    return this.userData;
  }

  getCurrentManufacturer(): { id: string; email: string; role: string; companyName: string } | null {
    if (this.userData?.role === 'manufacturer') {
      return {
        id: this.userData.id,
        email: this.userData.email,
        role: this.userData.role,
        companyName: this.userData.email.split('@')[0], // Simula el companyName
      };
    }
    return null;
  }

  isAuthenticated = {
    subscribe: (callback: (value: boolean) => void) => {
      callback(this.isLoggedIn());
      return { unsubscribe: () => {} };
    },
  };

  getUserCountry() {
    return 'Colombia';
  }

  getUserId() {
    return '12345';
  }
}

