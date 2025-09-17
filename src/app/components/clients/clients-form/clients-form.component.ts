
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { FormGroup, FormControl, Validators,FormsModule  } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ViewContainerRef } from '@angular/core';
import Swal from 'sweetalert2';
import {  NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, TitleStrategy } from '@angular/router';
import { ClientsService } from '../clients.service';

@Component({
  selector: 'app-clients-form',
  templateUrl: './clients-form.component.html',
  styleUrls: ['./clients-form.component.css']
})
export class ClientsFormComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef;
  model: NgbDateStruct;

  clientForm:any;
  editPopup: boolean;
  userRoles: any = [];
  clientFilters: string = '';
  errors: any = [];
  formError: any = {};
  isLoading: boolean = false;
  isSaving: boolean = false;
  submitted: boolean = false;

  constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private clientsService: ClientsService,
        private viewContainer: ViewContainerRef,
        private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    //this.getClientList();
    //this.getClientRoleList();
    this.setForm();
  }
  clearForm() {
    this.clientForm.reset();
  }
  public onDateSelect(event: any) {
    console.log(event);
    if (event.NgbDate !== undefined) {
      let newdate = `${event.NgbDate.day}/${event.NgbDate.month}/${event.NgbDate.year}`;
      this.clientForm.value.expiration = newdate
      this.model = event.NgbDate;
    }
  }

  async getNextMonthDate() {
    return new Promise(async (resolve, reject) => {
      let date = new Date();

      // Obtener el día, mes y año actual
      let day = date.getDate();
      let month = date.getMonth() + 1; // Los meses son de 0 a 11, sumamos 1
      let year = date.getFullYear();

      // Incrementar el mes en 1
      month += 1;

      // Si el mes es mayor a 12, ajustar el año y el mes
      if (month > 12) {
        month = 1;
        year += 1;
      }

      // Asegurar que el día es válido para el nuevo mes
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) {
        day = daysInMonth;
      }

      // Formatear el día y el mes para que siempre tengan dos dígitos
      let sday = day < 10 ? `0${day}` : day.toString();
      let smonth = month < 10 ? '0' + month : month;

      // Formatear la fecha en dd/mm/yyyy
      resolve(`${year}-${smonth}-${sday}`);
    });

  }

  async setForm() {
    console.log(`this.getNextMonthDate()`);
    console.log(this.getNextMonthDate());
    
    this.clientForm = new FormGroup({
      clientid: new FormControl(0),
      tenantid: new FormControl('Local', [Validators.required]),
      plan: new FormControl('Basico', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      account: new FormControl(''),
      name: new FormControl(''),
      lastname: new FormControl(''),
      email: new FormControl(''),
      phone: new FormControl(''),
      location: new FormControl(''),
      status: new FormControl('enabled'),
      maxdevices: new FormControl(1, [Validators.required]),
      obs: new FormControl(''),
      istrial: new FormControl(false, [Validators.required]),
      expiration: new FormControl(await this.getNextMonthDate(), [Validators.required])
    });

    this.clientForm.get('username').valueChanges
      .pipe(
        debounceTime(1000), // Espera 500 ms después del último evento
        distinctUntilChanged() // Evita ejecuciones si el valor no ha cambiado
      )
      .subscribe(value => {
        if (this.clientForm.get('username').valid) {
          //this.clientForm.reset();
         // this.verificarUsername(value);
        }
      });
  }



}
