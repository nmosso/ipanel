import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { FormGroup, FormControl, Validators,FormsModule  } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ViewContainerRef } from '@angular/core';
import Swal from 'sweetalert2';
import {  NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmationComponent } from '../../core/shared/components/confirmation/confirmation.component';
import { RolesService } from '../../core/shared/services/roles.service';
import { DevicesService } from './devices.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, TitleStrategy } from '@angular/router';

@Component({
  selector: 'app-client',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css'],
})
export class DevicesComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef;
  model: NgbDateStruct;
  
  dtOptions: DataTables.Settings = {};
  selectedRoles: any = [];
  closeResult: string;
  clientInfo: any;
  deviceForm: any;
  allDevices: any = [];
  allClients:any = [];
  clientRoles: any = [];
  allBrands: any = [];
  statusList: any = ['enabled','disabled'];
  planList:any = [{id:'Basico',name:'Basico'}]
  userRoles : any = [];
  clientFilters:string='';
  errors: any = [];
  formError: any = {};
  clientname:string='';
  tableColumns: [
    'Id',
    'Nombre de Usuario',
    'Correo Electrónico',
    'Teléfono',
    'Estado',
    'Acciones'
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
  clientid: number= null;

  rowClass: Record<string, string> = {
    online: 'row-online',
    offline: 'row-offline',
    disabled: 'row-disabled',
    connected: 'row-connected'
  };

  intervalId!: number;

  constructor(
    private roleService: RolesService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private devicesService: DevicesService,
    private viewContainer: ViewContainerRef,
    private cdr: ChangeDetectorRef
  ) {
    //this.clientInfo = JSON.parse(localStorage.getItem('clientInfo'));

  }

  ngOnDestroy() {
    window.clearInterval(this.intervalId);
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


  ngOnInit(): void {
    this.getDevicesList();
    this.getBrandsList();
    this.getClientList();
    this.setForm();
    

  }
async getStatusList() {
    this.statusList = [];
}
  async getDevicesList() {
    if (this.route.snapshot.paramMap.get('clientid') !== null) {
      this.clientid = Number.parseInt(this.route.snapshot.paramMap.get('clientid'));
      console.log(`Only Channel id: ${this.clientid} `)
      this.getDevicesByClientId(this.clientid);
      this.getClientbyClientId(this.clientid);
      this.intervalId = window.setInterval(() => this.getDevicesByClientId(this.clientid), 10000); // cada 10 seg
      //this.cdr.markForCheck();
    } else {
      this.clientid = null;
      console.log(`All Channels`)
      this.getDevices();
      window.clearInterval(this.intervalId);
      //this.cdr.markForCheck();
    }
  }
  async getDevices() {

    this.devicesService.getDevicesinfo(null, this.clientFilters).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allDevices = data;
    });
  }
  async getDevicesPreadd() {

    this.devicesService.getDevicesinfo(null, this.clientFilters).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allDevices = data;
    });
  }
  async getDevicesByClientId(clientID:number) {
  
    this.devicesService.getDevicesinfo(clientID,this.clientFilters).then((data:any)=>{ //getchannelsinfo
      console.log(data)
       this.allDevices = data;
    });
  }
  async getClientbyClientId(clientID:number) {
  
    this.devicesService.getDevicesinfo(clientID,this.clientFilters).then((data:any)=>{ //getchannelsinfo
      console.log(data)
       this.clientname = data[0].name;
    });
  }


  async getClientList() {

    this.devicesService.getClientsinfo(this.clientFilters).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allClients = data;
    });
  }


  async getBrandsList() {
    this.devicesService.getBrandList(this.clientFilters).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allBrands = data;
    });
    
  }

  trackByDeviceId(index: number, device: any): string {
    return device.deviceid;
  }


async  getNextMonthDate() {
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
    let sday = day < 10 ? `0${day}`: day.toString();
    let smonth = month < 10 ? '0' + month : month;

    // Formatear la fecha en dd/mm/yyyy
    resolve(`${year}-${smonth}-${sday}`);
  });
  
}

  async newDevice() {

    //this.formSubmissionFlag = true;
    this.devicesService.devicesPreAdd(this.clientid).then((dev:any)=>{ 
      
      this.getDevicesList();
      this.cdr.detectChanges();
      this.deviceForm.reset();
      this.deviceForm.patchValue({ 'deviceid': dev.deviceid });
      this.deviceForm.patchValue({ 'tenantid':dev.tenantid });
      this.deviceForm.patchValue({ 'clientid': dev.clientid});
      this.deviceForm.patchValue({ 'brand': dev.brand });
      this.deviceForm.patchValue({ 'barcode': dev.barcode });
      this.deviceForm.patchValue({ 'username': dev.username });
      this.deviceForm.patchValue({ 'password': dev.password });
      this.deviceForm.patchValue({ 'location': dev.location });
      this.deviceForm.patchValue({ 'status': 'disabled' });
      this.deviceForm.patchValue({ 'state': 'new' });
      this.deviceForm.patchValue({ 'obs': dev.obs });
      this.editPopup = true;
    }
    ).catch((err:any)=>{
      console.log(`Error en devicesPreAdd`);
      console.log(err);
    });
  }

  async setForm(isnew: boolean = false) {
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

  clearForm() {
    this.deviceForm.reset();
  }
  updateStatus(item) {
    item.status = item.status === 'enabled' ? 'disabled' : 'enabled';
    this.deviceForm.patchValue({ 'status': item.status });
    this.deviceForm.patchValue(item);
    this.devicesService.devicesUpdateStatus(item.username,item.status).then((data: any) => {
      this.formSubmissionFlag = false;
      this.closeModal.nativeElement.click();
      this.getDevicesList();
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
      Swal.fire({
        title: '',
        text: 'Error al modificar al Equipo',
        icon: 'error',
        confirmButtonText: 'Close'
      });

    });
  }


  getExpirationFromModel(expiration):string {
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
    const expiration = this.getExpirationFromModel(this.deviceForm.value.expiration);
    const formData: any = new FormData();
    formData.append('deviceid', this.deviceForm.value.deviceid);
    formData.append('tenantid', this.deviceForm.value.tenantid);
    formData.append('clientid', this.deviceForm.value.clientid);
    formData.append('brand', this.deviceForm.value.brand);
    formData.append('barcode', this.deviceForm.value.barcode);
    formData.append('username', this.deviceForm.value.username);
    formData.append('location', this.deviceForm.value.location);
    formData.append('status', this.deviceForm.value.status);
    formData.append('state', this.deviceForm.value.state);
    formData.append('obs', this.deviceForm.value.obs);


    this.devicesService.devicesAdd(this.formDataToJson(formData)).then((data:any)=>{ 
      this.deviceForm.reset();
      this.closeModal.nativeElement.click();
      this.formSubmissionFlag = false;
      this.getDevicesList();
      this.cdr.detectChanges();
      Swal.fire({
        title: '',
        text: 'Cliente creado',
        icon: 'success',
        confirmButtonText: 'Close'
      });
      
    }).catch((err:any)=>{
      Swal.fire({
        title: '',
        text: 'Error al crear el nuevo cliente',
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
    this.deviceForm.patchValue(i);
    this.editPopup = true;
  }
  devicesadd(client: any) {
    this.deviceForm.patchValue(client);
    this.editPopup = true;
  }
  update() {
    this.formSubmissionFlag = true;
    const expiration = this.getExpirationFromModel(this.deviceForm.value.expiration);
    const formData: any = new FormData();
    formData.append('deviceid', this.deviceForm.value.deviceid);
    formData.append('tenantid', this.deviceForm.value.tenantid);
    formData.append('clientid', this.deviceForm.value.clientid);
    //formData.append('name', this.deviceForm.value.name);
    formData.append('brand', this.deviceForm.value.brand);
    formData.append('barcode', this.deviceForm.value.barcode);
    formData.append('username', this.deviceForm.value.username);
    formData.append('location', this.deviceForm.value.location);
    formData.append('status', this.deviceForm.value.status);
    formData.append('state', this.deviceForm.value.state);
    formData.append('obs', this.deviceForm.value.obs);

    this.devicesService.devicesUpdate(this.formDataToJson(formData)).then((data:any)=>{ 
      this.formSubmissionFlag = false;
      this.closeModal.nativeElement.click();
      this.getDevicesList();
      this.cdr.detectChanges();
      Swal.fire({
        title: '',
        text: 'Device updated Successfully',
        icon: 'success',
        confirmButtonText: 'Close'
      });
      
    }).catch((err:any)=>{
      this.closeModal.nativeElement.click();
      this.formSubmissionFlag = false;
      Swal.fire({
        title: '',
        text: 'Error al modificar al Equipo',
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
        let device = { deviceid:i.deviceid, clientid:i.clientid };
        this.devicesService.devicesDelete(device).then((data:any)=>{ 
          this.getDevicesList();
          this.cdr.detectChanges();
          dialogRef.instance.visible = false;
                  Swal.fire({
                    title: '',
                    text: 'Device Deleted Successfully',
                    icon: 'success',
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
      this.formError.errorForEmail = 'Correo Electrónico es requerido';
      validFlag = false;
    } */
    validFlag = !(this.errorClientexists || this.errorClientNotexists);
    console.log(`Valid flag: ${validFlag}`)
/*     if (!this.clientForm.value.password) {
      this.errors.push('password');
      this.formError.errorForPassword = 'Contraseña es requerida';
      validFlag = false;
    } */
    return validFlag;
  }
}
