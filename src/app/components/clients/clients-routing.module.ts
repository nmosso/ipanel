import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientsComponent } from './clients.component';
import { ClientsFormComponent } from './clients-form/clients-form.component';

const routes: Routes = [
  { path: '', component: ClientsComponent },
  { path: ':clientid', component: ClientsFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
