import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../services/api-constants';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  displayedColumns: string[] = ['username', 'name', 'mode'];
  ocrSettings: any[] = [];
  displayedOcrColumns: string[] = ['value', 'actions'];
  newOcrValue: string = '';
  newOcrLoading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${API_BASE_URL}/all-user`).subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Failed to fetch users', err)
    });
    this.http.get<any[]>(`${API_BASE_URL}/settings-ocr`).subscribe({
      next: (data) => this.ocrSettings = data,
      error: (err) => console.error('Failed to fetch OCR settings', err)
    });
  }

  onModeToggle(user: any) {
    user.loading = true;
    this.http.post<any>(`${API_BASE_URL}/change-mode`, { username: user.username }).subscribe({
      next: (res) => {
        // Toggle mode locally for instant feedback (or use res.mode if returned)
        user.mode = user.mode === 1 ? 0 : 1;
        user.loading = false;
      },
      error: (err) => {
        console.error('Failed to change mode', err);
        user.loading = false;
      }
    });
  }

  onDeleteOcrSetting(setting: any) {
    this.http.post<any>(`${API_BASE_URL}/delete-settings-ocr`, { id: setting._id }).subscribe({
      next: () => {
        this.ocrSettings = this.ocrSettings.filter(s => s._id !== setting._id);
      },
      error: (err) => console.error('Failed to delete OCR setting', err)
    });
  }

  onAddOcrSetting() {
    if (!this.newOcrValue.trim()) return;
    this.newOcrLoading = true;
    this.http.post<any>(`${API_BASE_URL}/settings-ocr`, { value: this.newOcrValue.trim() }).subscribe({
      next: (res) => {
        this.ocrSettings.splice(this.ocrSettings.length - 1, 0, res);
        this.ocrSettings = [...this.ocrSettings];
        this.newOcrValue = '';
        this.newOcrLoading = false;
      },
      error: (err) => {
        console.error('Failed to add OCR setting', err);
        this.newOcrLoading = false;
      }
    });
  }
}
