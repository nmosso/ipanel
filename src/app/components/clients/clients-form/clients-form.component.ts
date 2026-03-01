
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ViewContainerRef } from '@angular/core';
import Swal from 'sweetalert2';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationComponent } from '../../../core/shared/components/confirmation/confirmation.component';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, TitleStrategy } from '@angular/router';
import { ClientsService } from '../clients.service';
import { DevicesService } from '../../devices/devices.service';

@Component({
  selector: 'app-clients-form',
  templateUrl: './clients-form.component.html',
  styleUrls: ['./clients-form.component.css']
})
export class ClientsFormComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef;
  model: NgbDateStruct;
  dtOptions: DataTables.Settings = {};
  dtOptionsSorted = {
    pagingType: 'full_numbers',
    pageLength: 10,
    ordering: true,
    order: [[0, 'desc']], // columna 0 = ID DESC
  };
  paymentForm: FormGroup;
  minDate: string;
  maxDate: string;
  minPartialDate: string;
  maxPartialDate: string;

  CurrenciesList: any = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'ARS', name: 'Argentinian Peso' }];

  clientForm: any;
  editPopup: boolean;
  userRoles: any = [];
  clientFilters: string = '';
  errors: any = [];
  formError: any = {};
  isLoading: boolean = false;
  isSaving: boolean = false;
  submitted: boolean = false;
  clients: any = {};
  allDevices: any = [];
  allDues: any = [];
  allLogs: any = [];
  allUnassignedDevices: any = [];
  allBrands: any = [];
  clientid: number = null;
  _interval: number = 3 * 1000; // cada N seg
  role = '';
  activeTab = 't1';
  deviceForm: any;
  formSubmissionFlag: boolean = false;
  clientStatus: string = '';

  rowClass: Record<string, string> = {
    online: 'row-online',
    offline: 'row-offline',
    disabled: 'row-disabled',
    connected: 'row-connected'
  };

  intervalId!: number;

  days: number[] = Array.from({ length: 30 }, (_, i) => i + 1);
  Plans: string[] = ['Basic', 'Custom'];
  allSelected = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private clientsService: ClientsService,
    private devicesService: DevicesService,
    private viewContainer: ViewContainerRef,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.role = localStorage.getItem('role');
    console.log(`Role: ${this.role}`);

  }

  ngOnInit(): void {
    this.getClient();
    //this.getClientRoleList();
    this.getLogs();
    this.getDevicesUnassignedByClientId();
    this.getDevicesList();
    this.setForm();
    this.setDeviceForm();
    this.getBrandsList();
    this.getDuesList();
    //this.partialPaymentFormInit();
    this.paymentFormGroupInit();


  }



  toggleAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.allSelected = checked;
    this.allDevices.forEach(d => d.selected = checked);
  }

  onRowSelect(device: any) {
    this.allSelected = this.allDevices.every(d => d.selected);
  }

  openTab(id: string, ev?: Event) {
    console.log(`Open Tab: ${id}`);
    this.activeTab = id;
  }

  trackByDeviceId(index: number, device: any): string {
    return device.deviceid;
  }
  trackByDueId(index: number, due: any): string {
    return due.dueid;
  }
  trackByLogId(index: number, log: any) {
    return log.id;
  }
  async getClient() {
    this.getClientInfo();
    this.getDevicesList();
    this.getDuesList();
    this.getLogs();
  }

  async getClientInfo() {
    if (this.route.snapshot.paramMap.get('clientid') !== null) {
      let clientid = Number.parseInt(this.route.snapshot.paramMap.get('clientid'));
      this.clientsService.getClientinfo(clientid.toString()).then((data: any) => { //getchannelsinfo
        console.log("Cliente: ", data.clients[0])
        this.clients = data.clients[0];
        this.clientForm.patchValue(this.clients);
        if (this.clients.substatus === 'New') {
          this.clientStatus = 'New';
        } else {
          this.clientStatus = this.clients.substatus;
        }
      });
    }
  }

  async getDevicesList() {
    if (this.route.snapshot.paramMap.get('clientid') !== null) {
      this.clientid = Number.parseInt(this.route.snapshot.paramMap.get('clientid'));
      console.log(`Only Channel id: ${this.clientid} `)
      this.getDevicesByClientId(this.clientid);

      this.intervalId = window.setInterval(() => this.getDevicesByClientId(this.clientid), this._interval); // cada n seg
      this.cdr.markForCheck();
    }
  }

  async getDevicesByClientId(clientID: number) {

    this.devicesService.getDevicesinfo(clientID, false).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allDevices = data;
    });
  }
  async getDevicesUnassignedByClientId() {

    this.devicesService.getDevicesinfo(null, true).then((data: any) => { //getchannelsinfo
      console.log(`List of unassigned devices:`, data)
      this.allUnassignedDevices = data;
    });
  }
  async getDuesList() {
    if (this.route.snapshot.paramMap.get('clientid') !== null) {
      this.clientid = Number.parseInt(this.route.snapshot.paramMap.get('clientid'));
      console.log(`Get Dues List for Clientid: ${this.clientid} `)
      this.clientsService.getDuesList(this.clientid).then((resp: any) => { //getchannelsinfo
        this.allDues = resp.dues.sort((a: any, b: any) => Number(b.dueid) - Number(a.dueid));
        console.log(`Dues List:`, this.allDues);
      }).catch((err: any) => {
        console.log('Error getting Dues List');
      });
    }
  }

  clearForm() {
    this.clientForm.reset();
  }

  async getBrandsList() {
    this.devicesService.getBrandList(this.clientFilters).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allBrands = data;
    });

  }

  async getLogs() {
    if (this.route.snapshot.paramMap.get('clientid') !== null) {
      this.clientid = Number.parseInt(this.route.snapshot.paramMap.get('clientid'));
      this.clientsService.getLogs(this.clientid).then((data: any) => { //getchannelsinfo
        console.log(data)
        this.allLogs = data.logs;
      });
    }

  }

  ngOnDestroy() {
    //window.clearInterval(this.intervalId);
  }
  statusBg(status: string) {
    switch ((status || '').toLowerCase()) {
      case 'online': return '#e7f7ee';
      case 'offline': return '#fde8e8';
      case 'disabled': return '#f3f4f6';
      case 'connected': return '#f7f6bfff';
      default: return 'transparent';
    }
  }
  statusFg(status: string) { return '#111827'; } // opcional
  statusStripe(status: string) { return 'rgba(0,0,0,.02)'; } // si usas .table-striped
  statusHover(status: string) { return 'rgba(0,0,0,.04)'; } // si usas .table-hover


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
      plan: new FormControl('Basic', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      account: new FormControl(''),
      name: new FormControl(''),
      lastname: new FormControl(''),
      email: new FormControl(''),
      dueday: new FormControl(''),
      extradays: new FormControl(''),
      unitprice: new FormControl(''),
      totaldevices: new FormControl(''),
      totalprice: new FormControl(''),
      phone: new FormControl(''),
      location: new FormControl(''),
      status: new FormControl('disabled'),
      substatus: new FormControl('New'),
      autorenew: new FormControl('disabled'),
      currency: new FormControl('ARS'),
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
  updateClient(statuschange: string = '') {
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
    if (statuschange === 'activate') {
      formData.set('status', 'enabled');
      formData.set('substatus', 'Active');
    }
    else if (statuschange === 'enabled') {
      formData.set('status', 'enabled');
      formData.set('substatus', 'Active');
    } else if (statuschange === 'disabled') {
      formData.set('status', 'disabled');
      formData.set('substatus', 'Inactive');
    }

    this.clientsService.clientUpdate(this.formDataToJson(formData)).then((data: any) => {
      this.getClient();
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
      this.getClient();
      Swal.fire({
        title: '',
        text: 'Error: ' + err.errmessage,
        icon: 'error',
        confirmButtonText: 'Close'
      });

    });

  }
  formDataToJson(formData: FormData): any {
    const json = {};
    formData.forEach((value, key) => {
      json[key] = value;
    });
    return json;
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

  async newDevice() {

    //this.formSubmissionFlag = true;
    this.devicesService.devicesPreAdd(this.clientid).then((dev: any) => {

      this.getDevicesList();
      this.cdr.detectChanges();
      this.deviceForm.reset();
      this.deviceForm.patchValue({ 'deviceid': dev.deviceid });
      this.deviceForm.patchValue({ 'tenantid': dev.tenantid });
      this.deviceForm.patchValue({ 'clientid': dev.clientid });
      this.deviceForm.patchValue({ 'brand': dev.brand });
      this.deviceForm.patchValue({ 'barcode': dev.barcode });
      this.deviceForm.patchValue({ 'username': dev.username });
      this.deviceForm.patchValue({ 'password': dev.password });
      this.deviceForm.patchValue({ 'location': dev.location });
      this.deviceForm.patchValue({ 'status': 'disabled' });
      this.deviceForm.patchValue({ 'state': 'new' });
      this.deviceForm.patchValue({ 'obs': dev.obs });
      this.deviceForm.patchValue({ 'dueday': dev.dueday });
      this.editPopup = true;
    }
    ).catch((err: any) => {
      console.log(`Error en devicesPreAdd`);
      console.log(err);
    });
  }

  async setDeviceForm(isnew: boolean = false) {
    // console.log(`this.getNextMonthDate()`);
    // console.log(this.getNextMonthDate());

    this.deviceForm = new FormGroup({
      selected: new FormControl(0),
      deviceid: new FormControl(0),
      tenantid: new FormControl('tenant2', [Validators.required]),
      clientid: new FormControl('', [Validators.required]),
      brand: new FormControl('', [Validators.required]),
      barcode: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl(''),
      location: new FormControl(''),
      status: new FormControl('enabled'),
      state: new FormControl('new'),
      obs: new FormControl(''),
    });

    // this.deviceForm.get('barcode').valueChanges
    //   .pipe(
    //     debounceTime(1000), // Espera 500 ms después del último evento
    //     distinctUntilChanged() // Evita ejecuciones si el valor no ha cambiado
    //   )
    //   .subscribe(value => {
    //     if (this.deviceForm.get('barcode').valid) {
    //       //this.clientForm.reset();
    //       //this.verificarUsername(value);
    //     }
    //   });
  }

  devicesClientAssign() {
    if (this.route.snapshot.paramMap.get('clientid') !== null) {
      let clientid = Number.parseInt(this.route.snapshot.paramMap.get('clientid'));
      this.formSubmissionFlag = true;
      const selectedDevices = this.allUnassignedDevices.filter(d => d.selected);
      console.log('Selected Devices to add:', selectedDevices);
      this.devicesService.devicesAssign(clientid, selectedDevices).then((data: any) => {
        this.formSubmissionFlag = false;
        this.closeModal.nativeElement.click();
        this.getDevicesUnassignedByClientId();
        this.getClient();
        this.getDevicesByClientId(clientid);
        this.cdr.detectChanges();
        Swal.fire({
          title: '',
          text: 'Devices Assigned Successfully',
          icon: 'success',
          confirmButtonText: 'Close'
        });
      }).catch((err: any) => {
        this.formSubmissionFlag = false;
        this.closeModal.nativeElement.click();
        this.getDevicesUnassignedByClientId();
        this.getClient();
        this.getDevicesByClientId(clientid);
        this.cdr.detectChanges();
        console.log('Error Assigning Devices: : ', err);
        Swal.fire({
          title: '',
          text: 'Error: ' + err.errmessage,
          icon: 'error',
          confirmButtonText: 'Close'
        });

      });
      this.formSubmissionFlag = false;
    }
  }

  clearDeviceForm() {
    this.deviceForm.reset();
    this.allUnassignedDevices.map(d => d.selected = false);
  }
  devicesread(i: any) {
    this.deviceForm.patchValue(i);
    this.editPopup = true;
  }
  updateDeviceStatus(item) {
    const clientStatus = this.clientForm.get('status') // forcamos update
    if (clientStatus?.value === 'disabled') {
      this.deviceForm.patchValue({ 'status': 'disabled' });
      Swal.fire({
        title: 'Status Cannot be changed ',
        text: 'Client is disabled. Enable the client to change device status.',
        icon: 'warning',
        confirmButtonText: 'Close'
      });
      return;
    } else {
      item.status = item.status === 'enabled' ? 'disabled' : 'enabled';
      this.deviceForm.patchValue({ 'status': item.status });
      this.deviceForm.patchValue(item);
      this.devicesService.devicesUpdateStatus(item.username, item.status).then((data: any) => {
        this.formSubmissionFlag = false;
        this.closeModal.nativeElement.click();
        this.getDevicesList();
        this.getClient();
        this.getDuesList();
        this.getLogs();

        this.cdr.detectChanges();
        Swal.fire({
          title: '',
          text: 'Device updated Successfully',
          icon: 'success',
          confirmButtonText: 'Close'
        });

      }).catch((err: any) => {
        this.closeModal.nativeElement.click();
        this.formSubmissionFlag = false;
        console.log('Error en Update Device Status: : ', err);
        this.getClient();
        Swal.fire({
          title: '',
          text: 'Error: ' + err.errmessage,
          icon: 'error',
          confirmButtonText: 'Close'
        });

      });
    }
  }


  deleteDevice(i: any) {
    const dialogRef = this.viewContainer.createComponent(ConfirmationComponent);
    dialogRef.instance.visible = true;
    let clientid = Number.parseInt(this.route.snapshot.paramMap.get('clientid'));
    dialogRef.instance.action.subscribe(x => {
      if (x) {
        let device = { username: i.username, deviceid: i.deviceid };
        this.devicesService.devicesUnassign(device).then((data: any) => {

          this.getDevicesUnassignedByClientId();
          this.getClient();
          if (clientid !== undefined || clientid !== null) this.getDevicesByClientId(clientid);
          this.cdr.detectChanges();
          dialogRef.instance.visible = false;
          Swal.fire({
            title: '',
            text: 'Device Deleted Successfully',
            icon: 'success',
            confirmButtonText: 'Close'
          });
        }).catch((err: any) => {
          this.closeModal.nativeElement.click();
          this.formSubmissionFlag = false;
          this.getDevicesUnassignedByClientId();
          this.getClient();
          if (clientid !== undefined || clientid !== null) this.getDevicesByClientId(clientid);

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

  paymentFormGroupInit() {
    const today = new Date();
    const min = new Date();
    min.setMonth(today.getMonth() - 1);

    const max = new Date();
    max.setDate(today.getDate() + 2);

    // this.minDate = min.toISOString().split('T')[0];
    // this.maxDate = max.toISOString().split('T')[0];

    const minpartial = new Date();
    minpartial.setMonth(today.getMonth() - 1);

    const maxpartial = new Date();
    maxpartial.setDate(today.getMonth() + 1);

    // this.minPartialDate = minpartial.toISOString().split('T')[0];
    // this.maxPartialDate = maxpartial.toISOString().split('T')[0];

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
  paymentRead(clients: any) {
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
          this.paymentForm.get('period')?.setValue(clients.duepreview.lastperiod);
        } else if (isPartial === false) {
          // Partial Payment = NO
          this.paymentForm.get('period')?.setValue(clients.duepreview.period);
        }
      }
    );
  }


  renewPayment() {
    this.paymentRead(this.clients);
  }

  clearPaymentForm() {
    this.paymentForm.reset();
    this.paymentFormGroupInit();
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
      clientid: this.clients.clientid
    };
    console.log('Payment Data: ', data);
    this.clientsService.createPayment(data).then(async (res: any) => {
      await this.closeModal.nativeElement.click();
      this.formSubmissionFlag = false;
      //this.getDevicesList();
      await this.getClient();
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
      this.getClient();
      Swal.fire({
        title: '',
        text: 'Error: ' + err.errmessage,
        icon: 'error',
        confirmButtonText: 'Close'
      });
    })

  }

  deletePayment(payment) {
    const dialogRef = this.viewContainer.createComponent(ConfirmationComponent);
    dialogRef.instance.visible = true;
    let clientid = Number.parseInt(this.route.snapshot.paramMap.get('clientid'));
    dialogRef.instance.action.subscribe(x => {
      if (x) {
        let data = { dueid: payment.dueid }
        this.clientsService.deletePayment(data).then((data: any) => {

          this.getDuesList();
          this.getClient();
          if (clientid !== undefined || clientid !== null) this.getDevicesByClientId(clientid);
          this.cdr.detectChanges();
          dialogRef.instance.visible = false;
          Swal.fire({
            title: '',
            text: 'Payment Deleted Successfully',
            icon: 'success',
            confirmButtonText: 'Close'
          });
        }).catch((err: any) => {
          this.closeModal.nativeElement.click();
          this.formSubmissionFlag = false;
          this.getDuesList();
          this.getClient();
          if (clientid !== undefined || clientid !== null) this.getDevicesByClientId(clientid);

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

}