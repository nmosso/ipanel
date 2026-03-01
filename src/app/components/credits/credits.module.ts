import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreditsRoutingModule } from './credits-routing.module';
import { CreditsComponent } from './credits.component';
import { SharedAppModule} from '../../core/shared/shared.module';
//import { CreditsFormComponent} from './credits-form/credits-form.component';

import { FormsModule } from '@angular/forms';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct, 	NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
@NgModule({
  declarations: [
    CreditsComponent
  ],
  imports: [
    CommonModule,
    CreditsRoutingModule,
    SharedAppModule,
    NgbDatepickerModule, NgbAlertModule, FormsModule, JsonPipe
  ],
  providers: [],
})
export class CreditsModule { }
