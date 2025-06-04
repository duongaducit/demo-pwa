import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../../services/api-constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  error: string | null = null;
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.error = null;
    this.loading = true;
    if (!navigator.onLine) {
      // Offline login process
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // You may want to hash the password in production
        if (user.username === this.username && user.password === this.password) {
          // Simulate token for offline mode
          localStorage.setItem('token', 'offline-token');
          this.router.navigate(['/']);
          this.loading = false;
          return;
        } else {
          this.error = 'Offline login failed. Please check your credentials.';
          this.loading = false;
          return;
        }
      } else {
        this.error = 'No user info available for offline login.';
        this.loading = false;
        return;
      }
    }
    // Online login process
    this.http.post<any>(`${API_BASE_URL}/login`, {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res));

        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = 'Login failed. Please check your credentials.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
} 