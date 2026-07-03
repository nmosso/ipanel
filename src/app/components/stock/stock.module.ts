import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockRoutingModule } from './stock-routing.module';
import { StockComponent } from './stock.component';
import { SharedAppModule } from '../../core/shared/shared.module';

import { FormsModule } from '@angular/forms';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
@NgModule({
  declarations: [
    StockComponent
  ],
  imports: [
    CommonModule,
    StockRoutingModule,
    SharedAppModule,
    NgbDatepickerModule, NgbAlertModule, FormsModule, JsonPipe
  ],
  providers: [],
})
export class StockModule { }

