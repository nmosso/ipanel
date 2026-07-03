import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandsRoutingModule } from './brands-routing.module';
import { BrandsComponent } from './brands.component';
import { SharedAppModule } from 'src/app/core/shared/shared.module';

@NgModule({
  declarations: [
    BrandsComponent
  ],
  imports: [
    CommonModule,
    BrandsRoutingModule,
    SharedAppModule
  ]
})
export class BrandsModule { }
