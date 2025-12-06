import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators,FormsModule  } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ViewContainerRef } from '@angular/core';
import Swal from 'sweetalert2';
import {  NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmationComponent } from '../../core/shared/components/confirmation/confirmation.component';
import { RolesService } from '../../core/shared/services/roles.service';
import { DevicesService } from './devices.service';

import { ActivatedRoute, TitleStrategy } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, of, filter, tap } from 'rxjs';
import { Device } from './devices-model';

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
  allDevices: Device[] = [];
  allFilteredDevices: Device[] = [];

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
  _interval:number = 3 * 1000; // cada N seg

  rowClass: Record<string, string> = {
    online: 'row-online',
    offline: 'row-offline',
    disabled: 'row-disabled',
    connected: 'row-connected'
  };

  allDevicesInfo: boolean = false;

  intervalId!: number;


  constructor(
     private zone: NgZone,
    private cd: ChangeDetectorRef,
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
      this.intervalId = window.setInterval(() => this.getDevicesByClientId(this.clientid), this._interval); // cada n seg
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
    //let params = {noclients: 'true'};
    this.devicesService.getDevicesinfo(null, this.allDevicesInfo).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allDevices = data.slice();
      this.allFilteredDevices = data.slice();;
    });
  }

  async getDevicesByClientId(clientID:number) {
  
    this.devicesService.getDevicesinfo(clientID, this.allDevicesInfo).then((data:any)=>{ //getchannelsinfo
      console.log(data)
      this.allDevices = data.slice();
      this.allFilteredDevices = data.slice();
    });
  }
  async getClientbyClientId(clientID:number) {
  
    this.devicesService.getDevicesinfo(clientID, this.allDevicesInfo).then((data:any)=>{ //getchannelsinfo
      console.log(data)
       this.clientname = data[0].name;
    });
  }

  updateDevicesInfoStatus() {
    console.log(`updateDevicesInfoStatus`);
    //this.allDevicesInfo = !this.allDevicesInfo;
    console.log(`allDevicesInfo: ${this.allDevicesInfo}`);
    this.allFilteredDevices = this.allFilteredDevices.slice(0,0);
    //this.filteredDevices.push(...newArray);
    if (this.allDevicesInfo) {
      this.safeReplaceDevices(this.allDevices.filter(d => d.clientid == null));
      //this.allFilteredDevices.push(...this.allDevices.filter(d => d.clientid == null));
    } else {
      this.safeReplaceDevices(this.allDevices.slice(0, this.allDevices.length));
      //this.allFilteredDevices = (this.allDevices.slice(0, this.allDevices.length));
    }
    this.cd.detectChanges();
    console.log(`allFilteredDevices: ${this.allFilteredDevices.length}`);
    console.log(this.allFilteredDevices);
    // console.log(`allDevicesInfo: ${this.allDevicesInfo}`);
    // this.devicesService.getDevicesinfo(null, this.allDevicesInfo).then((data: any) => { //getchannelsinfo
    //   console.log(data)
    //   this.allDevices = data;
    // });
  }

  // función segura para reemplazar la lista
  async safeReplaceDevices(newList: any[]) {
    console.log('safeReplaceDevices START', {
      oldLen: this.allFilteredDevices?.length,
      newLen: newList?.length
    });

    // 1) detect duplicates (debug)
    const ids = newList.map(d => d && d.deviceid);
    const dup = ids.filter((v, i, a) => v != null && a.indexOf(v) !== i);
    if (dup.length) {
      console.warn('safeReplaceDevices: duplicate deviceid found:', dup);
    }

    // 2) MUTAR el array existente para evitar reuso por posición
    // Esto hace que Angular retire nodos viejos antes de insertar nuevos.
    this.zone.run(() => {
      try {
        // vaciar primero (Angular removerá nodos existentes)
        this.allFilteredDevices.length = 0;
      } catch (e) {
        console.warn('safeReplaceDevices: error clearing array', e);
        this.allFilteredDevices = [];
      }
    });

    // 3) dar un micro-tick para que Angular aplique el vaciado y estabilice el DOM
    await Promise.resolve(); // microtask
    // opcional: un small timeout si tu app usa virtual-scroller con views muy costosas
    // await new Promise(r => setTimeout(r, 0));

    // 4) push de los nuevos elementos (no reasignar la referencia)
    this.zone.run(() => {
      try {
        this.allFilteredDevices.push(...(newList || []));
      } catch (e) {
        // fallback por si push falla
        this.allFilteredDevices = Array.isArray(newList) ? [...newList] : [];
      }
    });

    // 5) Si usás virtual scroll, forzá el refresh / checkViewportSize
    setTimeout(() => {
      try {
        // this.viewport?.checkViewportSize?.();
        // si usás ngx-virtual-scroller: this.virtualScroller?.refresh?.();
      } catch (e) {
        console.warn('safeReplaceDevices: viewport refresh error', e);
      }
      // 6) Evitar llamar detectChanges() inmediatamente en el mismo tick,
      // sino Angular intentará reconciliar mientras las vistas aún se están actualizando.
      try {
        this.cd.detectChanges();
      } catch (e) {
        // si falla, lo silenciamso y dejamos que Angular haga su ciclo naturalmente
        console.warn('safeReplaceDevices: detectChanges() failed (ignored)', e);
      }
    }, 0);

    console.log('safeReplaceDevices DONE', { nowLen: this.allFilteredDevices.length });
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


    this.deviceForm.get('barcode')?.valueChanges.pipe(
      map((v:string) => (v ?? '').trim()),
      debounceTime(500),
      distinctUntilChanged(),
      // evita pegarle al backend si está vacío
      switchMap((value: any) => this.devicesService.devicesBarcodeExists(value))
    ).subscribe((res: any) => {
      //debugger
      const cdev = this.deviceForm.get('deviceid').value;
      const ctrl = this.deviceForm.get('barcode');
      if (!ctrl) return;
      console.log(`Validando barcode...${res.barcode} `);
      // si existe (res.barcode con algo), marcamos el error
      if (res?.barcode && res?.deviceid !== null && res?.deviceid !== cdev) {
        const errs = { ...(ctrl.errors || {}), barcodeExists: true };
        ctrl.setErrors(errs);
        ctrl.markAsTouched();
      } else {
        // lo quitamos manteniendo otros errores que pueda tener el control
        const errs = { ...(ctrl.errors || {}) };
        delete (errs as any).barcodeExists;
        ctrl.setErrors(Object.keys(errs).length ? errs : null);
      }
    });
    this.deviceForm.get('username')?.valueChanges.pipe(
      map((v: string) => (v ?? '').trim()),
      debounceTime(500),
      distinctUntilChanged(),
      // evita pegarle al backend si está vacío
      switchMap((value: any) => (value in [null, undefined, ''] || value.length < 4) ? of({ username: '' }) : of(value)),
      switchMap((value: any) => this.devicesService.devicesUsernameExists(value))
    ).subscribe((res: any) => {
      //debugger
      const cdev = this.deviceForm.get('deviceid').value;
      const ctrl = this.deviceForm.get('username');
      if (!ctrl) return;
      console.log(`Validando username...${res.username} ${res.password} ${res.deviceid} para deviceid ${cdev} `);

      if (res?.username === undefined) {
        const errs = { ...(ctrl.errors || {}), usernameNotExists: true };
        ctrl.setErrors(errs);
        ctrl.markAsTouched();
        this.deviceForm.get('password')?.setValue('');
      } else if (res?.username !== undefined && res?.deviceid !== null && res?.deviceid !== cdev) {
        const errs = { ...(ctrl.errors || {}), usernameAssigned: true };
        ctrl.setErrors(errs);
        ctrl.markAsTouched();
        this.deviceForm.get('password')?.setValue('');
      } else {
        // lo quitamos manteniendo otros errores que pueda tener el control
        const errs = { ...(ctrl.errors || {}) };
        delete (errs as any).barcodeExists;
        ctrl.setErrors(Object.keys(errs).length ? errs : null);
        //this.deviceForm.get('username')?.setValue(res?.username);
        this.deviceForm.get('password')?.setValue(res?.password);
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
        text: 'Error al modificar al Equipo: ' + err.errmessage,
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
        text: 'Equipo modificado correctamente',
        icon: 'success',
        confirmButtonText: 'Close'
      });
      
    }).catch((err:any)=>{
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
        let device = { deviceid:i.deviceid, clientid:i.clientid };
        this.devicesService.devicesDelete(device).then((data:any)=>{ 
          this.getDevicesList();
          this.cdr.detectChanges();
          dialogRef.instance.visible = false;
                  Swal.fire({
                    title: '',
                    text: 'Equipo eliminado correctamente',
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
