import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ViewContainerRef } from '@angular/core';
import Swal from 'sweetalert2';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmationComponent } from '../../../app/core/shared/components/confirmation/confirmation.component';
import { RolesService } from '../../../app/core/shared/services/roles.service';
import { ClientsService } from './clients.service';
import { DevicesService } from '../devices/devices.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, TitleStrategy } from '@angular/router';
import { CurrencyPipe } from '@angular/common';


@Component({
  selector: 'app-client',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
})
export class ClientsComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef;
  model: NgbDateStruct;

  dtOptions: DataTables.Settings = {
    responsive: true,
    pageLength: 100,
    columnDefs: [
      { targets: [4, 5, 6],  className: 'd-none d-lg-table-cell' },
      { targets: [7, 8, 9],  className: 'd-none d-lg-table-cell' }
    ] as any
  };

  selectedRoles: any = [];
  closeResult: string;
  clientInfo: any;
  clientForm: any;
  allClients: any = [];
  clientRoles: any = [];
  statusList: any = ['enabled', 'disabled'];
  planList: any = [{ id: 'Basic', name: 'Basic' }]
  userRoles: any = [];
  clientFilters: string = '';
  errors: any = [];
  formError: any = {};
  tableColumns: [
    'Id',
    'Username',
    'Email',
    'Phone',
    'Status',
    'Actions'
  ];
  message: string;
  imagePath: any;
  createFormImageUrl: string | ArrayBuffer;
  editFormImageUrl: string | ArrayBuffer;
  changedFileName: string;
  clientImage: string;
  serverError: boolean;
  popUpShowHideFlag: boolean;
  editPopup: boolean;
  formSubmissionFlag: boolean = false;
  errorClientexists: boolean = false;
  errorClientNotexists: boolean = false;
  Params: any = {};
  days: number[] = Array.from({ length: 30 }, (_, i) => i + 1);
  CurrenciesList: any = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'ARS', name: 'Argentinian Peso' }];

  paymentForm: FormGroup;
  minDate: string;
  maxDate: string;
  minPartialDate: string;
  maxPartialDate: string;

  constructor(
    private roleService: RolesService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private clientsService: ClientsService,
    private devicesService: DevicesService,
    private viewContainer: ViewContainerRef,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    //this.clientInfo = JSON.parse(sessionStorage.getItem('clientInfo'));

  }

  ngOnInit(): void {
    this.getClientList();
    this.getClientRoleList();
    this.getParameters();
    this.setForm();
    this.paymentFormGroupInit();
  }
  async getStatusList() {
    this.statusList = [];
  }

  async getClientList() {

    this.clientsService.getClientsinfo(this.clientFilters).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allClients = data;
    });
  }
  async getParameters() {

    this.clientsService.getParameters().then((data: any) => { //getchannelsinfo
      console.log(data)
      this.Params = data;
    });
  }


  async getClientRoleList() {
    this.clientRoles = [];
  }
  trackByClientId(index: number, client: any): string {
    return client.clientid;
  }


  async getNextMonthDate() {
    return new Promise(async (resolve, reject) => {
      let date = new Date();

      // Obtener el dÃ­a, mes y aÃ±o actual
      let day = date.getDate();
      let month = date.getMonth() + 1; // Los meses son de 0 a 11, sumamos 1
      let year = date.getFullYear();

      // Incrementar el mes en 1
      month += 1;

      // Si el mes es mayor a 12, ajustar el aÃ±o y el mes
      if (month > 12) {
        month = 1;
        year += 1;
      }

      // Asegurar que el dÃ­a es vÃ¡lido para el nuevo mes
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) {
        day = daysInMonth;
      }

      // Formatear el dÃ­a y el mes para que siempre tengan dos dÃ­gitos
      let sday = day < 10 ? `0${day}` : day.toString();
      let smonth = month < 10 ? '0' + month : month;

      // Formatear la fecha en dd/mm/yyyy
      resolve(`${year}-${smonth}-${sday}`);
    });

  }

  async setForm() {
    //console.log(`this.getNextMonthDate()`);
    //console.log(this.getNextMonthDate());
    console.log(`Params on setForm: `, this.Params);
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
      autorenew: new FormControl(this.Params.autorenew || 'disabled'),
      status: new FormControl('disabled'),
      substatus: new FormControl('New'),
      currency: new FormControl(this.Params.currency || 'ARS'),
      maxdevices: new FormControl(1, [Validators.required]),
      dueday: new FormControl(Number.parseInt(this.Params.dueday) || 15, [Validators.required]),
      extradays: new FormControl(Number.parseInt(this.Params.extradays) || 0, [Validators.required]),
      unitprice: new FormControl(this.Params.unitprice || 0, [Validators.required]),
      totaldevices: new FormControl(''),
      totalprice: new FormControl(''),
      obs: new FormControl(''),
      istrial: new FormControl(false, [Validators.required]),
      expiration: new FormControl(await this.getNextMonthDate(), [Validators.required])
    });

    this.clientForm.get('username').valueChanges
      .pipe(
        debounceTime(1000), // Espera 500 ms despuÃ©s del Ãºltimo evento
        distinctUntilChanged() // Evita ejecuciones si el valor no ha cambiado
      )
      .subscribe(value => {
        if (this.clientForm.get('username').valid) {
          //this.clientForm.reset();
          this.verificarUsername(value);
        }
      });
  }

  verificarUsername(valor: string): void {
    // LÃ³gica de verificaciÃ³n para el nombre de usuario

    let tenantid = sessionStorage.getItem('tenantid');
    if (tenantid === 'server23' || tenantid === 'server7') {
      console.log('Verificando el nombre de usuario:', valor);
      this.errorClientexists = false;
      this.errorClientNotexists = false;
      this.clientsService.getnewUserExists(valor).then((data: any) => {

        //this.clientForm.get('username')
        //this.accountrm.get('username')
        let date = Date.now();

        //this.clientForm.value.expiration = newdate
        this.clientForm.patchValue({ 'name': data.name });
        this.clientForm.patchValue({ 'account': data.name });
        this.clientForm.patchValue({ 'password': data.password });
        this.clientForm.patchValue({ 'email': data.email });
        this.clientForm.patchValue({ 'phone': data.phone });

        //this.clientForm.patchValue({ 'expiration': newdate });
        console.log(data);
      }).catch((ex: any) => {
        console.log(`DATA ERROR ON REQUEST CLIENTEXISTS`)
        console.log(ex.error);
        if (ex.error.status === 406) {
          console.log(`uSuario existe`)
          console.log(ex.error.status === 406)
          this.errorClientexists = true;
        }

        else if (ex.error.status === 404) {
          this.errorClientNotexists = true;
        }
        this.cdr.detectChanges();
      })
    } else {
      console.log(`no tenantid ${tenantid}`)
    }
  }


  clearForm() {
    this.clientForm.reset();
  }
  updateStatus(item) {
    item.status = item.status === 'enabled' ? 'disabled' : 'enabled';

    this.clientForm.patchValue({ 'status': item.status });
    this.clientForm.patchValue(item);
    this.clientsService.clientUpdateStatus(item.clientid, item.status, item.substatus).then((data: any) => {
      this.getClientList();
      this.cdr.detectChanges();
      this.formSubmissionFlag = false;
      this.closeModal.nativeElement.click();
      Swal.fire({
        title: '',
        text: 'Client updated Successfully',
        icon: 'success',
        confirmButtonText: 'Close'
      });

    }).catch((err: any) => {
      this.closeModal.nativeElement.click();
      this.formSubmissionFlag = false;
      Swal.fire({
        title: '',
        text: 'Error: ' + err.errmessage,
        icon: 'error',
        confirmButtonText: 'Close'
      });

    });
  }


  public onDateSelect(event: any) {
    console.log(event);
    if (event.NgbDate !== undefined) {
      let newdate = `${event.NgbDate.day}/${event.NgbDate.month}/${event.NgbDate.year}`;
      this.clientForm.value.expiration = newdate
      this.model = event.NgbDate;
    }
  }

  getExpirationFromModel(expiration): string {
    console.log(expiration);

    if (this.model !== undefined && this.model.year !== undefined) {
      let newdate = `${this.model.year}/${this.model.month}/${this.model.day}`;
      return newdate;
    } else {
      return expiration;
    }
  }
  create() {
    if (!this.validForm()) {
      return;
    }
    this.formSubmissionFlag = true;
    const expiration = this.getExpirationFromModel(this.clientForm.value.expiration);
    const formData: any = new FormData();
    formData.append('tenantid', this.clientForm.value.tenantid);
    formData.append('plan', this.clientForm.value.plan);
    formData.append('username', this.clientForm.value.username);
    formData.append('password', this.clientForm.value.password);
    formData.append('account', this.clientForm.value.account);
    formData.append('name', this.clientForm.value.name);
    formData.append('lastname', this.clientForm.value.lastname);
    formData.append('email', this.clientForm.value.email);
    formData.append('phone', this.clientForm.value.phone);
    formData.append('location', this.clientForm.value.location);
    formData.append('maxdevices', this.clientForm.value.maxdevices);
    formData.append('status', this.clientForm.value.status);
    formData.append('substatus', this.clientForm.value.substatus);
    formData.append('autorenew', this.clientForm.value.autorenew);
    formData.append('currency', this.clientForm.value.currency);
    formData.append('obs', this.clientForm.value.obs);
    formData.append('istrial', this.clientForm.value.istrial);
    formData.append('expiration', expiration);
    formData.append('dueday', this.clientForm.value.dueday);
    formData.append('extradays', this.clientForm.value.extradays);
    formData.append('unitprice', this.clientForm.value.unitprice);
    formData.append('totaldevices', this.clientForm.value.totaldevices);
    formData.append('totalprice', this.clientForm.value.totalprice);
    this.clientsService.clientAdd(this.formDataToJson(formData)).then((data: any) => {
      this.getClientList();
      this.cdr.detectChanges();
      this.clientForm.reset();
      this.closeModal.nativeElement.click();
      this.formSubmissionFlag = false;
      Swal.fire({
        title: '',
        text: 'Client created',
        icon: 'success',
        confirmButtonText: 'Close'
      });

    }).catch((err: any) => {
      Swal.fire({
        title: '',
        text: 'Error: ' + err.errmessage,
        icon: 'error',
        confirmButtonText: 'Close'
      });
      this.closeModal.nativeElement.click();
      this.formSubmissionFlag = false;
    });

  }
  formDataToJson(formData: FormData): any {
    const json = {};
    formData.forEach((value, key) => {
      json[key] = value;
    });
    return json;
  }

  read(i: any) {
    this.clientForm.patchValue(i);
    this.editPopup = true;
  }
  devicesadd(client: any) {
    this.clientForm.patchValue(client);
    this.editPopup = true;
  }
  update() {
    this.formSubmissionFlag = true;
    const expiration = this.getExpirationFromModel(this.clientForm.value.expiration);
    const formData: any = new FormData();
    formData.append('clientid', this.clientForm.value.clientid);
    formData.append('tenantid', this.clientForm.value.tenantid);
    formData.append('plan', this.clientForm.value.plan);
    formData.append('username', this.clientForm.value.username);
    formData.append('password', this.clientForm.value.password);
    formData.append('account', this.clientForm.value.account);
    formData.append('name', this.clientForm.value.name);
    formData.append('lastname', this.clientForm.value.lastname);
    formData.append('email', this.clientForm.value.email);
    formData.append('phone', this.clientForm.value.phone);
    formData.append('location', this.clientForm.value.location);
    formData.append('maxdevices', this.clientForm.value.maxdevices);
    formData.append('obs', this.clientForm.value.obs);
    formData.append('status', this.clientForm.value.status);
    formData.append('substatus', this.clientForm.value.substatus);
    formData.append('autorenew', this.clientForm.value.autorenew);
    formData.append('currency', this.clientForm.value.currency);
    formData.append('istrial', this.clientForm.value.istrial);
    formData.append('expiration', expiration);
    formData.append('dueday', this.clientForm.value.dueday);
    formData.append('extradays', this.clientForm.value.extradays);
    formData.append('unitprice', this.clientForm.value.unitprice);
    formData.append('totaldevices', this.clientForm.value.totaldevices);
    formData.append('totalprice', this.clientForm.value.totalprice);
    this.clientsService.clientUpdate(this.formDataToJson(formData)).then((data: any) => {
      this.getClientList();
      this.cdr.detectChanges();
      this.formSubmissionFlag = false;
      this.closeModal.nativeElement.click();
      Swal.fire({
        title: '',
        text: 'Client updated Successfully',
        icon: 'success',
        confirmButtonText: 'Close'
      });

    }).catch((err: any) => {
      this.closeModal.nativeElement.click();
      this.formSubmissionFlag = false;
      Swal.fire({
        title: '',
        text: 'Error: ' + err.errmessage,
        icon: 'error',
        confirmButtonText: 'Close'
      });

    });

  }

  delete(i: any) {
    const dialogRef = this.viewContainer.createComponent(ConfirmationComponent);
    dialogRef.instance.visible = true;
    dialogRef.instance.action.subscribe(x => {
      if (x) {
        let client = { clientid: i.clientid }
        this.clientsService.clientDelete(client).then((data: any) => {
          this.getClientList();
          this.cdr.detectChanges();
          dialogRef.instance.visible = false;
          Swal.fire({
            title: '',
            text: 'Client Deleted Successfully',
            icon: 'success',
            confirmButtonText: 'Close'
          });
        }).catch((err: any) => {
          this.closeModal.nativeElement.click();
          this.formSubmissionFlag = false;
          Swal.fire({
            title: '',
            text: 'Error: ' + err.errmessage,
            icon: 'error',
            confirmButtonText: 'Close'
          });

        });
      }
    });
  }

  validForm() {
    this.errors = [];
    this.formError = {};
    let validFlag = true;
    /*     if (!this.clientForm.value.email) {
          this.errors.push('email');
          this.formError.errorForEmail = 'Correo ElectrÃ³nico es requerido';
          validFlag = false;
        } */
    validFlag = !(this.errorClientexists || this.errorClientNotexists);
    console.log(`Valid flag: ${validFlag}`)
    /*     if (!this.clientForm.value.password) {
          this.errors.push('password');
          this.formError.errorForPassword = 'ContraseÃ±a es requerida';
          validFlag = false;
        } */
    return validFlag;
  }



  paymentFormGroupInit() {
    const today = new Date();
    const min = new Date();
    min.setMonth(today.getMonth() - 1);

    const max = new Date();
    max.setDate(today.getDate() + 2);

    //this.minDate = min.toISOString().split('T')[0];
    //this.maxDate = max.toISOString().split('T')[0];

    const minpartial = new Date();
    minpartial.setMonth(today.getMonth() - 1);

    const maxpartial = new Date();
    maxpartial.setDate(today.getMonth() + 1);

    //this.minPartialDate = minpartial.toISOString().split('T')[0];
    //this.maxPartialDate = maxpartial.toISOString().split('T')[0];

    this.paymentForm = this.fb.group({
      paymentamount: [0, [Validators.required, Validators.min(0.01)]],
      paymentcurrency: ['USD', Validators.required],
      paymentdate: [today.toISOString().split('T')[0], Validators.required],
      duedate: ['', Validators.required],
      period: ['', Validators.required],
      lastperiod: ['', Validators.required],
      startdate: ['', Validators.required],
      paymentpartial: ['', Validators.required],
      clientid: ['', Validators.required],
    });

  }
  paymentFormInit(clients: any) {
    const today = new Date();
    this.paymentForm.get('paymentamount')?.setValue(clients.totalprice);
    this.paymentForm.get('paymentcurrency')?.setValue(clients.currency);
    this.paymentForm.get('paymentdate')?.setValue(today.toISOString().split('T')[0]); 
    this.paymentForm.get('duedate')?.setValue(clients.duepreview.duedate);
    this.paymentForm.get('period')?.setValue(clients.duepreview.period);
    this.paymentForm.get('lastperiod')?.setValue(clients.duepreview.lastperiod);
    this.paymentForm.get('startdate')?.setValue(clients.duepreview.startdate);
    this.paymentForm.get('paymentpartial')?.setValue(clients.duepreview.paymentpartial);
    this.paymentForm.get('clientid')?.setValue(clients.clientid); 
    this.paymentForm.get('paymentpartial')?.valueChanges.subscribe(
      (isPartial: boolean) => {
        if (isPartial === true) {
          // Partial Payment = YES
          if (clients.duepreview.lastperiod !== undefined)
            this.paymentForm.get('period')?.setValue(clients.duepreview.lastperiod);
          else
            this.paymentForm.get('period')?.setValue(clients.duepreview.period);
        } else if (isPartial === false) {
          // Partial Payment = NO
          this.paymentForm.get('period')?.setValue(clients.duepreview.period);
        }
      }
    );
  }

  clearPaymentForm() {
    this.paymentForm.reset();
  }
  createPayment() {
    this.formSubmissionFlag = true;
    let data = {
      paymentdate: this.paymentForm.get('paymentdate').value,
      paymentamount: this.paymentForm.get('paymentamount').value,
      paymentcurrency: this.paymentForm.get('paymentcurrency').value,
      duedate: this.paymentForm.get('duedate').value,
      period: this.paymentForm.get('period').value,
      lastperiod: this.paymentForm.get('lastperiod').value,
      startdate: this.paymentForm.get('startdate').value,
      paymentpartial: this.paymentForm.get('paymentpartial').value,
      clientid: this.paymentForm.get('clientid').value,
    };
    console.log('Payment Data: ', data);
    this.clientsService.createPayment(data).then(async (res: any) => {
      await this.closeModal.nativeElement.click();
      this.formSubmissionFlag = false;
      this.getClientList();
      this.cdr.detectChanges();
      await Swal.fire({
        title: '',
        text: 'Payment Successfully Added',
        icon: 'success',
        confirmButtonText: 'Close'
      });

    }).catch((err: any) => {
      this.closeModal.nativeElement.click();
      this.formSubmissionFlag = false;
      console.log('Error en Update payment: : ', err);
      this.getClientList();
      Swal.fire({
        title: '',
        text: 'Error: ' + err.errmessage,
        icon: 'error',
        confirmButtonText: 'Close'
      });
    })

  }

}
