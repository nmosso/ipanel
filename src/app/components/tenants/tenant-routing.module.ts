import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantComponent } from './tenant.component';
import { TenantFormComponent } from './tenant-form/tenant-form.component';

const routes: Routes = [
  { path: '', component: TenantComponent },
  { path: ':tenantid', component: TenantFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantRoutingModule { }
