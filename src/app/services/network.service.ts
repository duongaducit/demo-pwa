import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public online$ = this.onlineSubject.asObservable();

  constructor(private zone: NgZone) {
    window.addEventListener('online', () => {
      this.zone.run(() => this.onlineSubject.next(true));
    });
    window.addEventListener('offline', () => {
      this.zone.run(() => this.onlineSubject.next(false));
    });
  }

  /**
   * Returns true if the user in localStorage has mode === 1
   */
  public isUserModeOffline(): boolean {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;
      const user = JSON.parse(userStr);
      return user.mode === 1;
    } catch {
      return false;
    }
  }
} 