import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import { AuthService } from '../auth/auth.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

class FakeAuthService {
  userData = { email: 'admin@example.com' };

  getUserData() {
    return this.userData;
  }

  getUsers() {
    return of({
      users: [
        { email: 'user1@example.com', role: 'manufacturer', authorized: false },
        { email: 'user2@example.com', role: 'seller', authorized: false },
        { email: 'user3@example.com', role: 'admin', authorized: true }
      ]
    });
  }

  authorizeUser(user: any) {
    return of(user);
  }
}

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let authService: FakeAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminComponent,
        FormsModule,
        TranslateModule.forRoot()
      ],
      providers: [{ provide: AuthService, useClass: FakeAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize userName and unauthorizedUsers on ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component.userName).toBe('admin@example.com');
    expect(component.unauthorizedUsers.length).toBe(2);
    expect(component.unauthorizedUsers.every(user => user.role === 'manufacturer' || user.role === 'seller')).toBeTrue();
  }));

  it('should filter users based on searchTerm', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.searchTerm = 'user1';
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].email).toBe('user1@example.com');

    component.searchTerm = 'seller';
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].role).toBe('seller');

    component.searchTerm = 'nonexistent';
    expect(component.filteredUsers.length).toBe(0);
  }));

  it('should set successMessageVisible to true when authorize is successful', fakeAsync(() => {
    component.ngOnInit();
    tick();
    const user = component.unauthorizedUsers[0];
    component.authorize(user);
    tick();
    expect(user.authorized).toBeTrue();
    expect(component.successMessageVisible).toBeTrue();
  }));


  it('should close success message', () => {
    component.successMessageVisible = true;
    component.closeSuccessMessage();
    expect(component.successMessageVisible).toBeFalse();
  });

  it('should close error message', () => {
    component.errorMessageVisible = true;
    component.closeErrorMessage();
    expect(component.errorMessageVisible).toBeFalse();
  });
});
