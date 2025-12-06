import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantRoutingModule } from './tenant-routing.module';
import { TenantComponent } from './tenant.component';
import { SharedAppModule } from 'src/app/core/shared/shared.module';
import { TenantFormComponent } from './tenant-form/tenant-form.component';


@NgModule({
  declarations: [
    TenantComponent,
    TenantFormComponent
  ],
  imports: [
    CommonModule,
    TenantRoutingModule,
    SharedAppModule
  ]
})
export class TenantModule { }
