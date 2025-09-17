import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';
import { SharedAppModule } from 'src/app/core/shared/shared.module';
import { ClientsFormComponent } from './clients-form/clients-form.component';


@NgModule({
  declarations: [
    ClientsComponent,
    ClientsFormComponent
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    SharedAppModule
  ]
})
export class ClientsModule { }
