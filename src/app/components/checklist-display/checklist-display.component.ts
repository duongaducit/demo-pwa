import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checklist-display',
  templateUrl: './checklist-display.component.html',
  styleUrls: ['./checklist-display.component.scss']
})
export class ChecklistDisplayComponent implements OnInit {
  checklists: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  async ngOnInit(): Promise<void> {
    await ChecklistDisplayComponent.initDB();
    this.fetchAndStoreChecklists();
    this.fetchAndStoreProducts();
  }

  static initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ChecklistAppDB', 3);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('checklists')) {
          db.createObjectStore('checklists', { keyPath: 'checklist_id' });
        }
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'jancode' });
        }
      };
      request.onsuccess = () => {
        request.result.close();
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  goToDetail(checklistId: string) {
    this.router.navigate(['/checklist-detail', checklistId]);
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  }

  fetchAndStoreChecklists() {
    this.loading = true;
    if (!navigator.onLine) {
      this.loadChecklistsFromIndexedDB();
      return;
    }
    const options = this.getAuthHeaders();
    this.http.get<any[]>('http://localhost:3000/checklists', options).subscribe({
      next: (data) => {
        this.saveChecklistsToIndexedDB(data);
        this.loadChecklistsFromIndexedDB();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load checklists.';
        this.loading = false;
        this.loadChecklistsFromIndexedDB();
      }
    });
  }

  fetchAndStoreProducts() {
    const options = this.getAuthHeaders();
    this.http.get<any[]>('http://localhost:3000/products', options).subscribe({
      next: (products) => {
        this.saveProductsToIndexedDB(products);
      },
      error: (err) => {
        console.error('Failed to fetch products:', err);
      }
    });
  }

  saveChecklistsToIndexedDB(checklists: any[]) {
    const request = indexedDB.open('ChecklistAppDB');
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const tx = db.transaction('checklists', 'readwrite');
      const store = tx.objectStore('checklists');
      checklists.forEach((newChecklist) => {
        if (!newChecklist.checklist_id) return;
        const getReq = store.get(newChecklist.checklist_id);
        getReq.onsuccess = () => {
          const existingChecklist = getReq.result;
          if (!existingChecklist) {
            // Insert new checklist if not exists
            store.put(newChecklist);
            return;
          }
          // Merge details
          const mergedDetails: any[] = [];
          const existingDetails = Array.isArray(existingChecklist.details) ? existingChecklist.details : [];
          const newDetails = Array.isArray(newChecklist.details) ? newChecklist.details : [];
          newDetails.forEach((newDetail: any) => {
            const jancode = newDetail.jancode || newDetail;
            const existingDetail = existingDetails.find((d: any) => (d.jancode || d) === jancode);
            if (existingDetail) {
              if (existingChecklist.status === 1) {
                // Keep existing value if status is 1
                mergedDetails.push(existingDetail);
              } else {
                // Update with new value
                mergedDetails.push(newDetail);
              }
            } else {
              // Insert new detail
              mergedDetails.push(newDetail);
            }
          });
          // Add any existing details not in newDetails (to preserve all)
          existingDetails.forEach((exDetail: any) => {
            const jancode = exDetail.jancode || exDetail;
            if (!newDetails.find((d: any) => (d.jancode || d) === jancode)) {
              mergedDetails.push(exDetail);
            }
          });
          console.log(existingChecklist);
          const updatedChecklist = { ...existingChecklist, ...newChecklist, details: mergedDetails, status: existingChecklist.status};
          console.log(updatedChecklist);
          store.put(updatedChecklist);
        };
      });
      tx.oncomplete = () => {
        db.close();
      };
    };
    request.onerror = (event: any) => {
      console.error('IndexedDB error:', event.target.errorCode);
    };
  }

  saveProductsToIndexedDB(products: any[]) {
    const request = indexedDB.open('ChecklistAppDB');
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        if (getAllReq.result && getAllReq.result.length > 0) {
          db.close();
          return;
        }
        products.forEach(product => {
          if (product.jancode) {
            store.put(product);
          }
        });
        tx.oncomplete = () => {
          db.close();
        };
      };
      getAllReq.onerror = () => {
        db.close();
      };
    };
    request.onerror = (event: any) => {
      console.error('IndexedDB error:', event.target.errorCode);
    };
  }

  loadChecklistsFromIndexedDB() {
    const userStr = localStorage.getItem('user');
    let currentUser: any = null;
    try {
      currentUser = userStr ? JSON.parse(userStr) : null;
    } catch {}
    const request = indexedDB.open('ChecklistAppDB');
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const tx = db.transaction('checklists', 'readonly');
      const store = tx.objectStore('checklists');
      const getAllReq = store.getAll();
      getAllReq.onsuccess = () => {
        let results = getAllReq.result;
        if (currentUser && results && results.length) {
          results = results.filter((c: any) => c.user === currentUser.username);
        }
        this.checklists = results;
        this.loading = false;
      };
      getAllReq.onerror = () => {
        this.error = 'Failed to load checklists from offline storage.';
        this.loading = false;
      };
      tx.oncomplete = () => {
        db.close();
      };
    };
    request.onerror = (event: any) => {
      this.error = 'Failed to open offline storage.';
    };
  }
} 