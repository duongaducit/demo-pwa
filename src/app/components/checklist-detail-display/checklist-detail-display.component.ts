import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-checklist-detail-display',
  templateUrl: './checklist-detail-display.component.html',
  styleUrls: ['./checklist-detail-display.component.scss']
})
export class ChecklistDetailDisplayComponent implements OnInit {
  checklistId: string | null = null;
  products: { jancode: string, productname: string, dateline: string, datetime: string, status: number }[] = [];
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.checklistId = this.route.snapshot.paramMap.get('id');
    if (this.checklistId) {
      this.loadChecklistAndProducts(this.checklistId);
    } else {
      this.error = 'No checklist ID provided.';
      this.loading = false;
    }
  }

  goToProductDetail(jancode: string, name: string, dateline?: string) {
    const queryParams: any = { checklist_id: this.checklistId };
    if (dateline) {
      queryParams.dateline = dateline;
      queryParams.name = name;
    }
    this.router.navigate(['/product-detail',this.checklistId, jancode], { queryParams });
  }

  loadChecklistAndProducts(id: string) {
    const request = indexedDB.open('ChecklistAppDB');
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('checklists')) {
        db.createObjectStore('checklists', { keyPath: 'checklist_id' });
      }
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'jancode' });
      }
    };
    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const tx = db.transaction(['checklists', 'products'], 'readonly');
      const checklistStore = tx.objectStore('checklists');
      let key = Number(id);
      const checklistReq = checklistStore.get(key);
      checklistReq.onsuccess = () => {
        const checklist = checklistReq.result;
        console.log(checklist);
        if (!checklist || !checklist.details) {
          this.error = 'Checklist not found or has no products.';
          this.loading = false;
          db.close();
          return;
        }
        const productList: { jancode: string, productname: string, dateline: string, datetime: string, status: number }[] = [];
        let remaining = checklist.details.length;
        if (remaining === 0) {
          this.products = [];
          this.loading = false;
          db.close();
          return;
        }
        checklist.details.forEach((product: any) => {
          const productStore = tx.objectStore('products');
          const jancode = String(product.jancode);
          const dateline = String(product.dateline);
          const datetime = String(product.datetime);
          const status = String(product.status);
          const productReq = productStore.get(jancode);
          productReq.onsuccess = () => { 
            productList.push({
              jancode,
              productname: productReq.result ? productReq.result.name : '(Unknown)',
              dateline: dateline,
              datetime: datetime,
              status: Number(status)
            });
            remaining--;
            if (remaining === 0) {
              this.products = productList;
              this.loading = false;
              db.close();
            }
          };
          productReq.onerror = () => {
            productList.push({ jancode, productname: '(Unknown)', dateline: '', datetime: '', status: 2 });
            remaining--;
            if (remaining === 0) {
              this.products = productList;
              this.loading = false;
              db.close();
            }
          };
        });
      };
      checklistReq.onerror = () => {
        this.error = 'Failed to load checklist from offline storage.';
        this.loading = false;
        db.close();
      };
    };
    request.onerror = (event: any) => {
      console.log(event);
      this.error = 'Failed to open offline storage.';
      this.loading = false;
    };
  }

  onBack() {
    this.router.navigate(['/checklist-display']);
  }
} 