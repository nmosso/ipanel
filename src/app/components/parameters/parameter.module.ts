import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParameterRoutingModule } from './parameter-routing.module';
import { ParameterComponent } from './parameter.component';
import { SharedAppModule } from 'src/app/core/shared/shared.module';


@NgModule({
  declarations: [
    ParameterComponent
  ],
  imports: [
    CommonModule,
    ParameterRoutingModule,
    SharedAppModule
  ]
})
export class ParameterModule { }