import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedDataService } from './services/sharedata.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private router: Router, private sharedDataService: SharedDataService) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

}
