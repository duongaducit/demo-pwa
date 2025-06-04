import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'YYYY-MM-DD' },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY MMM',
    dateA11yLabel: 'YYYY-MM-DD',
    monthYearA11yLabel: 'YYYY MMM',
  },
};

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'ja' }
  ]
})
export class ProductDetailComponent implements OnInit {
  jancode: string | null = null;
  name: string | null = null;
  date: moment.Moment | null = null;
  checklistId: string | null = null;
  error: string | null = null;
  success: string | null = null;
  dateline: string | null = null;
  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.jancode = this.route.snapshot.paramMap.get('jancode');
    this.checklistId = this.route.snapshot.paramMap.get('checklistId');
    this.name = this.route.snapshot.queryParamMap.get('name');
    this.dateline = this.route.snapshot.queryParamMap.get('dateline');
    if (this.dateline) {
      this.date = moment(this.dateline);
    }
  }

  onBack() {
    if (this.checklistId) {
      this.router.navigate(['/checklist-detail', this.checklistId]);
    }
  }

  async onUpdate() {
    this.error = null;
    this.success = null;
    if (!this.date) {
      this.error = 'Date is required.';
      return;
    }
    console.log(this.checklistId, this.jancode);
    if (!this.checklistId || !this.jancode) {
      this.error = 'Missing checklist or product information.';
      return;
    }
    const formattedDate = this.date.format('YYYY-MM-DD');
    const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
    // Open IndexedDB and update the product date in the checklist
    const request = indexedDB.open('ChecklistAppDB');
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const tx = db.transaction('checklists', 'readwrite');
      const store = tx.objectStore('checklists');
      const getReq = store.get(this.checklistId && !isNaN(Number(this.checklistId)) ? Number(this.checklistId) : this.checklistId);
      getReq.onsuccess = () => {
        const checklist = getReq.result;
        if (!checklist || !Array.isArray(checklist.details)) {
          this.error = 'Checklist not found or invalid structure.';
          db.close();
          return;
        }
        // Find the product in details and update its date
        let found = false;
        checklist.details = checklist.details.map((prod: any) => {
          if ((prod.jancode || prod) === this.jancode) {
            found = true;
            if (typeof prod === 'object') {
              return { ...prod,  dateline: formattedDate, datetime: dateNow, status:navigator.onLine ? 2 : 1  };
            } else {
              return { jancode: prod, dateline: formattedDate, datetime: dateNow, status:navigator.onLine ? 2 : 1 };
            }
          }
          return prod;
        });
        if (!found) {
          this.error = 'Product not found in checklist.';
          db.close();
          return;
        }
        // Set checklist.status: 1 if any detail has status 1, else 2
        if (checklist.details.some((prod: any) => prod.status === 1)) {
          checklist.status = 1;
        } else {
          checklist.status = 2;
        }
        // Save back to IndexedDB
        const putReq = store.put(checklist);
        putReq.onsuccess = () => {
          db.close();
          if (!navigator.onLine) {
            this.success = 'Product updated locally (offline mode).';
            return;
          }
          // If online, call API
          const body = {
            checklistId: this.checklistId,
            jancode: this.jancode,
            dateline: formattedDate
          };
          this.http.post('http://localhost:3000/update-product', body).subscribe({
            next: () => {
              this.success = 'Product updated successfully!';
            },
            error: () => {
              this.error = 'Failed to update product on server.';
            }
          });
        };
        putReq.onerror = () => {
          this.error = 'Failed to update checklist in offline storage.';
          db.close();
        };
      };
      getReq.onerror = () => {
        this.error = 'Failed to load checklist from offline storage.';
        db.close();
      };
    };
    request.onerror = (event: any) => {
      this.error = 'Failed to open offline storage.';
    };
  }
} 