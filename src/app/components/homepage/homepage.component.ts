import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../services/api-constants';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomePageComponent implements OnInit {
  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${API_BASE_URL}/settings-ocr`).subscribe({
      next: (data) => {
        const values = data.map(item => item.value);
        localStorage.setItem('settings-ocr', JSON.stringify(values));
      },
      error: (err) => console.error('Failed to fetch settings-ocr', err)
    });
  }

  onButtonClick() {
    this.router.navigate(['/checklist-display']);
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
} 