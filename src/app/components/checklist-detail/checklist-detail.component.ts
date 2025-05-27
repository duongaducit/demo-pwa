import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checklist-detail',
  templateUrl: './checklist-detail.component.html',
  styleUrls: ['./checklist-detail.component.scss']
})
export class ChecklistDetailComponent implements OnInit {
  checklist: any = null;
  loading = true;
  error: string | null = null;
  id: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.fetchChecklist(this.id);
    } else {
      this.error = 'Invalid checklist ID.';
      this.loading = false;
    }
  }

  fetchChecklist(id: string) {
    this.loading = true;
    this.http.get<any>(`http://localhost:3000/checklists/${id}`).subscribe({
      next: (data) => {
        // If data is an array, add status and dateline to each element
        if (Array.isArray(data)) {
          this.checklist = data.map((item: any) => ({
            ...item,
            status: 0,
            dateline: null
          }));
        } else {
          this.checklist = data;
        }
        this.loading = false;
        // Save to localStorage for offline fallback
        localStorage.setItem(`checklist_${id}`, JSON.stringify(this.checklist));
      },
      error: (err) => {
        this.error = 'Failed to load checklist detail.';
        this.loading = false;
        // Try to load from localStorage if available
        const cached = localStorage.getItem(`checklist_${id}`);
        if (cached) {
          this.checklist = JSON.parse(cached);
          this.error = null;
        }
      }
    });
  }

  isLastProduct(product: any, products: any[]): boolean {
    return products.indexOf(product) === products.length - 1;
  }
}
