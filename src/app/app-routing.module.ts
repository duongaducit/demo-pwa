import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateComponent } from './components/translate/translate.component';
import { OcrComponent } from './components/ocr/ocr.component';
import { ChecklistListComponent } from './components/checklist-list/checklist-list.component';
import { ChecklistDetailComponent } from './components/checklist-detail/checklist-detail.component';

const routes: Routes = [
  { path: 'translate', component: TranslateComponent },
  { path: 'ocr', component: OcrComponent },
  { path: 'checklists', component: ChecklistListComponent },
  { path: 'checklists/:id', component: ChecklistDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
