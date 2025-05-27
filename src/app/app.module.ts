import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule } from '@angular/forms';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateComponent } from './components/translate/translate.component';
import { OcrComponent } from './components/ocr/ocr.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ChecklistListComponent } from './components/checklist-list/checklist-list.component';
import { ChecklistDetailComponent } from './components/checklist-detail/checklist-detail.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoadingOverlayComponent,
    TranslateComponent,
    OcrComponent,
    ChecklistListComponent,
    ChecklistDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
