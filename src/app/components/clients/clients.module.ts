import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';
import { SharedAppModule} from '../../../app/core/shared/shared.module';
import { ClientsFormComponent} from './clients-form/clients-form.component';

import { FormsModule } from '@angular/forms';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct, 	NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
@NgModule({
  declarations: [
    ClientsComponent,
    ClientsFormComponent
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    SharedAppModule,
    NgbDatepickerModule, NgbAlertModule, FormsModule, JsonPipe
  ],
  providers: [],
})
export class ClientsModule { }
