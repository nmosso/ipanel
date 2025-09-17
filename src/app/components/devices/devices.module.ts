import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevicesRoutingModule } from './devices-routing.module';
import { DevicesComponent } from './devices.component';
import { SharedAppModule} from '../../core/shared/shared.module';
import { DevicesFormComponent} from './devices-form/devices-form.component';

import { FormsModule } from '@angular/forms';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct, 	NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
@NgModule({
  declarations: [
    DevicesComponent,
    DevicesFormComponent
  ],
  imports: [
    CommonModule,
    DevicesRoutingModule,
    SharedAppModule,
    NgbDatepickerModule, NgbAlertModule, FormsModule, JsonPipe
  ],
  providers: [],
})
export class DevicesModule { }
