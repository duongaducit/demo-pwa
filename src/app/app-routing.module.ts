import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomePageComponent } from './components/homepage/homepage.component';
import { ChecklistDisplayComponent } from './components/checklist-display/checklist-display.component';
import { ChecklistDetailDisplayComponent } from './components/checklist-detail-display/checklist-detail-display.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { AdminComponent } from './components/admin/admin.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomePageComponent },
  { path: 'checklist-display', component: ChecklistDisplayComponent },
  { path: 'checklist-detail/:id', component: ChecklistDetailDisplayComponent },
  { path: 'product-detail/:checklistId/:jancode', component: ProductDetailComponent },
  { path: 'admin', component: AdminComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
