import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParameterComponent } from './parameter.component';

const routes: Routes = [{ path: '', component: ParameterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParameterRoutingModule { }