import { Component } from '@angular/core';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-network-overlay',
  template: `
    <ng-container *ngIf="!(networkService.online$ | async)">
      <div *ngIf="networkService.isUserModeOffline(); else fullScreenOverlay" class="network-bar">
        <span class="warning-icon">&#9888;</span>
        <span>オフラインです。<br>データはキャッシュから表示されています。</span>
      </div>
      <ng-template #fullScreenOverlay>
        <div class="network-fullscreen">
          <span class="warning-icon">&#9888;</span>
          <div>
            <div style="font-size:1.3rem; font-weight:600; margin-bottom:8px;text-align:center;">オフラインです</div>
            <div style="text-align:center;">アカウントはオフラインモードに対応しておりません。管理者までご連絡ください。</div>
          </div>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: [`
    .network-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: #d9534f;
      color: #fff;
      text-align: center;
      padding: 12px 0;
      font-size: 1.1rem;
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      pointer-events: none;
    }
    .network-fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #d9534f;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-size: 1.2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .warning-icon {
      font-size: 2.5rem;
      margin-bottom: 12px;
    }
  `]
})
export class NetworkOverlayComponent {
  constructor(public networkService: NetworkService) {}
} 