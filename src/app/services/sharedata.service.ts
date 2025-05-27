// shared-data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedDataService {
  private dataSetting = new BehaviorSubject<any>({
    selectedTool: '0',
    selectedCamera: '0',
    selectedFormat: {
      yyyyMMdd: true,
      yyMMdd: true,
      mmddYYYY: true,
    },
  });
  currentDataSetting$ = this.dataSetting.asObservable();

  setDataSetting(data: any) {
    this.dataSetting.next(data);
  }
}
