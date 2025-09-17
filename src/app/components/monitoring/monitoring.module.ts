import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringRoutingModule } from './monitoring-routing.module';
import { MonitoringComponent } from './monitoring.component';
import { SharedAppModule} from '../../core/shared/shared.module';

import { FormsModule } from '@angular/forms';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct, 	NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import { SafeUrlPipe } from './safe-url.pipe';
@NgModule({
  declarations: [
    MonitoringComponent,
    SafeUrlPipe
  ],
  imports: [
    CommonModule,
    MonitoringRoutingModule,
    SharedAppModule,
    NgbDatepickerModule, NgbAlertModule, FormsModule, JsonPipe
  ],
  providers: [],
})
export class MonitoringModule { }
