import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../services/loading.service';
import { SharedDataService } from 'src/app/services/sharedata.service';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss']
})
export class TranslateComponent {
  title = 'i18n-demo';
  selectedCountry = 'ja';
  selectedTool = '0';
  selectedCamera = '0';
  selectedFormat = {
    yyyyMMdd: true,
    yyMMdd: true,
    mmddYYYY: true,
  };
  countries = [
    { key: 'ja', value: 'countries.japan' },
    { key: 'en', value: 'countries.united_kingdom' }
  ];

  constructor(
    public translate: TranslateService,
    private http: HttpClient,
    private loadingService: LoadingService,
    private sharedDataService: SharedDataService
  ) {
    translate.setDefaultLang('ja');
    translate.use('ja');
  }

  setDataSetting() {
    let dataSetting = {
      selectedTool: this.selectedTool,
      selectedCamera: this.selectedCamera,
      selectedFormat: this.selectedFormat,
    }
    this.sharedDataService.setDataSetting(dataSetting);
  }

  async onCountryChange(event: any) {
    const languageCode = this.selectedCountry.split('-')[0];
    
    try {
      this.loadingService.show();
      const apiResponse = await this.http.get('http://18.179.6.145:3000/translate?language=' + languageCode).toPromise();
      this.translate.use(languageCode);
    } catch (error) {
      console.error('Error sending to API:', error);
    } finally {
      this.loadingService.hide();
    }
  }

  onToolChange(event: any) {
    console.log(event);
    this.setDataSetting();
  } 

  onCameraChange(event: any) {
    console.log(event);
    this.setDataSetting();
  }
  
  onFormatChange(value: any) {  
    console.log(value);
    this.setDataSetting();
  }
}
