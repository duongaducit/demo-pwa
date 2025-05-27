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

  goToTranslate() {
    this.router.navigate(['/translate']);
  }

  goToOcr() {
    this.router.navigate(['/ocr']);
  }
}
