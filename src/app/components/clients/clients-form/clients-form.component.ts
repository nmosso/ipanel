
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { FormGroup, FormControl, Validators,FormsModule  } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ViewContainerRef } from '@angular/core';
import Swal from 'sweetalert2';
import {  NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
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

  clientForm:any;
  editPopup: boolean;
  userRoles: any = [];
  clientFilters: string = '';
  errors: any = [];
  formError: any = {};
  isLoading: boolean = false;
  isSaving: boolean = false;
  submitted: boolean = false;
  clients: any = {};
  allDevices: any = {};
  allBrands: any = [];
  clientid: number = null;
  _interval: number = 3 * 1000; // cada N seg

  deviceForm: any;
  formSubmissionFlag: boolean = false;

  rowClass: Record<string, string> = {
    online: 'row-online',
    offline: 'row-offline',
    disabled: 'row-disabled',
    connected: 'row-connected'
  };

  intervalId!: number;

  days: number[] = Array.from({ length: 30 }, (_, i) => i + 1);

  constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private clientsService: ClientsService,
        private devicesService: DevicesService,
        private viewContainer: ViewContainerRef,
        private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getClient();
    //this.getClientRoleList();
    this.getDevicesList()
    this.setForm();
    this.setDeviceForm();
    this.getBrandsList();
    
  }

  trackByDeviceId(index: number, device: any): string {
    return device.deviceid;
  }

  async getClient() {
    if (this.route.snapshot.paramMap.get('clientid') !== null) {
      let clientid = Number.parseInt(this.route.snapshot.paramMap.get('clientid'));
      this.clientsService.getClientinfo(clientid.toString()).then((data: any) => { //getchannelsinfo
        console.log("Cliente: ",data.clients[0])
        this.clients = data.clients[0];
        this.clientForm.patchValue(this.clients);
        //this.allDevices = data.devices;
      });
    }
  }

  async getDevicesList() {
    if (this.route.snapshot.paramMap.get('clientid') !== null) {
      this.clientid = Number.parseInt(this.route.snapshot.paramMap.get('clientid'));
      console.log(`Only Channel id: ${this.clientid} `)
      this.getDevicesByClientId(this.clientid);
      this.intervalId = window.setInterval(() => this.getDevicesByClientId(this.clientid), this._interval); // cada n seg
      //this.cdr.markForCheck();
    } 
  }
  async getDevicesByClientId(clientID: number) {

    this.devicesService.getDevicesinfo(clientID, true).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allDevices = data;
    });
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
      plan: new FormControl('Basico', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      account: new FormControl(''),
      name: new FormControl(''),
      lastname: new FormControl(''),
      email: new FormControl(''),
      dueday: new FormControl(''),
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
  updateClient() {
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
    formData.append('istrial', this.clientForm.value.istrial);
    formData.append('expiration', expiration);
    formData.append('dueday', this.clientForm.value.dueday);
    this.clientsService.clientUpdate(this.formDataToJson(formData)).then((data:any)=>{ 
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
      
    }).catch((err:any)=>{
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
    console.log(`this.getNextMonthDate()`);
    console.log(this.getNextMonthDate());

    this.deviceForm = new FormGroup({
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

    this.deviceForm.get('barcode').valueChanges
      .pipe(
        debounceTime(1000), // Espera 500 ms después del último evento
        distinctUntilChanged() // Evita ejecuciones si el valor no ha cambiado
      )
      .subscribe(value => {
        if (this.deviceForm.get('barcode').valid) {
          //this.clientForm.reset();
          //this.verificarUsername(value);
        }
      });
  }

  clearDeviceForm() {
    this.deviceForm.reset();
  }
  devicesread(i: any) {
    this.deviceForm.patchValue(i);
    this.editPopup = true;
  }
  updateDeviceStatus(item) {
      item.status = item.status === 'enabled' ? 'disabled' : 'enabled';
      this.deviceForm.patchValue({ 'status': item.status });
      this.deviceForm.patchValue(item);
      this.devicesService.devicesUpdateStatus(item.username,item.status).then((data: any) => {
        this.formSubmissionFlag = false;
        this.closeModal.nativeElement.click();
        this.getDevicesList();
        this.getClient();
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

    delete(i: any) {
      const dialogRef = this.viewContainer.createComponent(ConfirmationComponent);
      dialogRef.instance.visible = true;
      dialogRef.instance.action.subscribe(x => {
        if (x) {
          let device = { username:i.username };
          this.devicesService.devicesDelete(device).then((data:any)=>{ 
            this.getDevicesList();
            this.getClient();
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
            this.getClient();
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
