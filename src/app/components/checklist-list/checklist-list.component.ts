import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checklist-list',
  templateUrl: './checklist-list.component.html',
  styleUrls: ['./checklist-list.component.scss']
})
export class ChecklistListComponent implements OnInit {
  checklists: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchChecklists();
  }

  fetchChecklists() {
    this.loading = true;
    this.http.get<any[]>('http://localhost:3000/checklists').subscribe({
      next: (data) => {
        this.checklists = data;
        this.loading = false;
        // Optionally, store in localStorage for manual fallback
        localStorage.setItem('checklists', JSON.stringify(data));
      },
      error: (err) => {
        this.error = 'Failed to load checklist.';
        this.loading = false;
        // Try to load from localStorage if available
        const cached = localStorage.getItem('checklists');
        if (cached) {
          this.checklists = JSON.parse(cached);
        }
      }
    });
  }
}
