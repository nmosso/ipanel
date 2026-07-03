import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { TenantsService } from '../tenant.service';
import { DevicesService } from '../../devices/devices.service';
//import { ConfirmationComponent } from '../../../../core/shared/components/confirmation/confirmation.component';
import { ConfirmationComponent } from '../../../core/shared/components/confirmation/confirmation.component';

@Component({
  selector: 'app-tenant-form',
  templateUrl: './tenant-form.component.html',
  styleUrls: ['./tenant-form.component.css']
})
export class TenantFormComponent implements OnInit {
  @ViewChild('closeModal') closeModal!: ElementRef;

  dtOptions: DataTables.Settings = {
    pageLength: 100
  };
  tenantForm!: FormGroup;
  tenantFilters: string = '';
  errors: any = [];
  formError: any = {};
  isLoading: boolean = false;
  isSaving: boolean = false;
  tenantData: any = {};
  allDevices: any = [];
  tenantid: string | null = null;
  _interval: number = 3 * 1000;
  role = '';
  activeTab = 't1';
  deviceForm!: FormGroup;
  formSubmissionFlag: boolean = false;
  editPopup: boolean = false;

  // Managing devices variables
  activeDeviceTab: string = 't1';
  deviceManageForm!: FormGroup;
  allUnassignedDevices: any[] = [];
  allBrands: any[] = [];
  allSelected: boolean = false;

  intervalId!: number;
  mastertenantid: string = '';
  plans: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private tenantsService: TenantsService,
    private devicesService: DevicesService,
    private viewContainer: ViewContainerRef,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.role = sessionStorage.getItem('role') || '';
    this.mastertenantid = sessionStorage.getItem('tenantid') || '';
  }

  ngOnInit(): void {
    this.setForm();
    this.setDeviceForm();
    this.setDeviceManageForm();
    this.getTenant();
    this.getPlans();
    this.getDevicesList();
    this.getBrandsList();
    this.getDevicesUnassigned();
  }

  openTab(id: string, ev?: Event) {
    this.activeTab = id;
  }

  trackByDeviceId(index: number, device: any): string {
    return device.deviceid;
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
  statusFg(status: string) { return '#111827'; }
  statusStripe(status: string) { return 'rgba(0,0,0,.02)'; }
  statusHover(status: string) { return 'rgba(0,0,0,.04)'; }

  async getTenant() {
    if (this.route.snapshot.paramMap.get('tenantid') !== null) {
      this.tenantid = this.route.snapshot.paramMap.get('tenantid');
      if (this.tenantid) {
        this.tenantsService.getTenantinfo(this.tenantid).then((data: any) => {
          this.tenantData = data[0];
          this.tenantForm.patchValue(this.tenantData);
        });
      }
    }
  }
  async getPlans() {
    this.tenantsService.getPlans().then((data: any) => {
      this.plans = data;
    });
  }
  async getDevicesList() {
    if (this.route.snapshot.paramMap.get('tenantid') !== null) {
      this.tenantid = this.route.snapshot.paramMap.get('tenantid');
      if (this.tenantid) {
        this.getDevicesByTenantId(this.tenantid);
        this.intervalId = window.setTimeout(() => this.getDevicesByTenantId(this.tenantid as string), this._interval);
        this.cdr.markForCheck();
      }
    }
  }

  async getDevicesByTenantId(tenantID: string) {
    this.devicesService.getDevicesinfo(null, false, tenantID).then((data: any) => {
      this.allDevices = data;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }

  setForm() {
    this.tenantForm = this.fb.group({
      tenantid: [''],
      identityid: [''],
      tenant: ['', Validators.required],
      email: ['', Validators.required],
      planid: [''],
      phone: [''],
      location: [''],
      status: ['disabled'],
      loginstatus: [''],
      client: [''],
    });
  }

  updateTenant() {
    console.log(`Update plan id`, this.tenantForm.value.planid);
    this.formSubmissionFlag = true;
    const formData: any = new FormData();
    formData.append('tenantid', this.tenantForm.value.tenantid || this.tenantid);
    formData.append('identityid', this.tenantForm.value.identityid || '');
    formData.append('tenant', this.tenantForm.value.tenant || '');
    formData.append('email', this.tenantForm.value.email || '');
    formData.append('planid', this.tenantForm.value.planid || '');
    formData.append('phone', this.tenantForm.value.phone || '');
    formData.append('location', this.tenantForm.value.location || '');
    formData.append('status', this.tenantForm.value.status || '');
    formData.append('client', this.tenantForm.value.client || '');
    formData.append('loginstatus', this.tenantForm.value.loginstatus || '');

    this.tenantsService.editUser(formData).then((res: any) => {
      this.formSubmissionFlag = false;
      this.getTenant();
      this.cdr.detectChanges();
      Swal.fire({
        title: '',
        text: 'Tenant updated successfully',
        icon: 'success',
        confirmButtonText: 'Close'
      });
    }).catch((err: any) => {
      this.formSubmissionFlag = false;
      console.log('Error updating tenant', err);
      Swal.fire({
        title: 'Error!',
        text: err.errmessage || 'Error updating tenant',
        icon: 'error',
        confirmButtonText: 'Close'
      });
    });
  }

  setDeviceForm() {
    this.deviceForm = this.fb.group({
      selected: [0],
      deviceid: [0],
      tenantid: ['', Validators.required],
      clientid: ['', Validators.required],
      brand: ['', Validators.required],
      barcode: ['', Validators.required],
      username: ['', Validators.required],
      password: [''],
      location: [''],
      status: ['enabled'],
      state: ['new'],
      obs: [''],
    });
  }

  setDeviceManageForm() {
    this.deviceManageForm = this.fb.group({
      deviceid: [0],
      tenantid: [this.tenantid || '', Validators.required],
      clientid: [''],
      brand: ['', Validators.required],
      barcode: ['', Validators.required],
      username: ['', Validators.required],
      password: [''],
      location: [''],
      status: ['enabled'],
      state: ['new'],
      obs: [''],
    });

    // barcode logic
    this.deviceManageForm.get('barcode')?.valueChanges.subscribe((value: any) => {
      if (value && value.trim().length > 3) {
        this.devicesService.devicesBarcodeExists(value).then((res: any) => {
          const cdev = this.deviceManageForm.get('deviceid')?.value;
          const ctrl = this.deviceManageForm.get('barcode');
          if (!ctrl) return;
          if (res?.barcode && res?.deviceid !== null && res?.deviceid !== cdev) {
            ctrl.setErrors({ ...ctrl.errors, barcodeExists: true });
            ctrl.markAsTouched();
          } else {
            const errs = { ...ctrl.errors };
            delete (errs as any).barcodeExists;
            ctrl.setErrors(Object.keys(errs).length ? errs : null);
          }
        });
      }
    });

    // username logic
    this.deviceManageForm.get('username')?.valueChanges.subscribe((value: any) => {
      if (value && value.trim().length > 3) {
        this.devicesService.devicesUsernameExists(value).then((res: any) => {
          const cdev = this.deviceManageForm.get('deviceid')?.value;
          const ctrl = this.deviceManageForm.get('username');
          if (!ctrl) return;
          if (res?.username === undefined) {
            ctrl.setErrors({ ...ctrl.errors, usernameNotExists: true });
            ctrl.markAsTouched();
            this.deviceManageForm.get('password')?.setValue('');
          } else if (res?.username !== undefined && res?.deviceid !== null && res?.deviceid !== cdev) {
            ctrl.setErrors({ ...ctrl.errors, usernameAssigned: true });
            ctrl.markAsTouched();
            this.deviceManageForm.get('password')?.setValue('');
          } else {
            const errs = { ...ctrl.errors };
            delete (errs as any).usernameNotExists;
            delete (errs as any).usernameAssigned;
            ctrl.setErrors(Object.keys(errs).length ? errs : null);
            this.deviceManageForm.get('password')?.setValue(res?.password || '');
          }
        });
      }
    });
  }

  getBrandsList() {
    this.devicesService.getBrandList('').then((data: any) => {
      this.allBrands = data;
    });
  }

  getDevicesUnassigned() {
    this.devicesService.getDevicesinfo(null, true, null, true).then((data: any) => {
      this.allUnassignedDevices = data;
    });
  }

  openDeviceTab(id: string, ev?: Event) {
    console.log("openDeviceTab called with id: ",id);
    this.activeDeviceTab = id;
    if (this.route.snapshot.paramMap.get('tenantid') !== null) {
      this.tenantid = this.route.snapshot.paramMap.get('tenantid');
      if (id === 't2' && this.tenantid) {
        this.devicesService.devicesPreAdd(null).then((dev: any) => { 
          //console.log("device info: new device",dev);
          this.deviceManageForm.get('tenantid')?.setValue(this.tenantid);
          this.deviceManageForm.get('username')?.setValue(dev.username);
          this.deviceManageForm.get('password')?.setValue(dev.password);
          this.deviceManageForm.get('deviceid')?.setValue(dev.deviceid);

        });
      }
    }
  }

  clearDeviceManageForm() {
    this.deviceManageForm.reset();
    if (this.tenantid) {
      this.deviceManageForm.get('tenantid')?.setValue(this.tenantid);
    }
  }

  toggleAllUnassigned(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.allSelected = checked;
    this.allUnassignedDevices.forEach(d => d.selected = checked);
  }

  onRowSelectUnassigned(device: any) {
    this.allSelected = this.allUnassignedDevices.every(d => d.selected);
  }

  hasSelectedUnassignedDevices(): boolean {
    return this.allUnassignedDevices.some(d => d.selected);
  }

  createTenantDevice() {
    if (this.deviceManageForm.invalid) return;
    this.formSubmissionFlag = true;
    const formData: any = new FormData();
    formData.append('deviceid', this.deviceManageForm.value.deviceid);
    formData.append('tenantid', this.tenantid || '');
    formData.append('clientid', '');
    formData.append('brand', this.deviceManageForm.value.brand);
    formData.append('barcode', this.deviceManageForm.value.barcode);
    formData.append('username', this.deviceManageForm.value.username);
    formData.append('location', this.deviceManageForm.value.location || '');
    formData.append('status', this.deviceManageForm.value.status || 'enabled');
    formData.append('state', this.deviceManageForm.value.state || 'new');
    formData.append('obs', this.deviceManageForm.value.obs || '');

    // Convert FormData to json
    const json: any = {};
    formData.forEach((value: any, key: any) => json[key] = value);

    this.devicesService.devicesUpdate(json).then((data: any) => {
      this.clearDeviceManageForm();
      this.formSubmissionFlag = false;
      this.getDevicesByTenantId(this.tenantid as string);
      document.getElementById('tenant-devices-modal')?.click(); // trigger close

      let closeEvent = new MouseEvent('click', { bubbles: true });
      document.querySelector('#tenant-devices-modal .close')?.dispatchEvent(closeEvent);

      Swal.fire('Success', 'Device Registered successfully', 'success');
    }).catch((err: any) => {
      this.formSubmissionFlag = false;
      Swal.fire('Error', err.errmessage || 'Error creating device', 'error');
    });
  }

  async devicesTenantAssign() {
    if (!this.tenantid) return;
    this.formSubmissionFlag = true;
    const selectedDevices = this.allUnassignedDevices.filter(d => d.selected);

    try {
      // Loop over and update each unassigned device with the tenantid
      for (let device of selectedDevices) {
        let updatePayload = {
          deviceid: device.deviceid,
          tenantid: this.tenantid,
          clientid: '',
          brand: device.brand,
          barcode: device.barcode,
          username: device.username,
          status: device.status,
          state: device.state
        };
        await this.devicesService.devicesUpdate(updatePayload);
      }
      this.formSubmissionFlag = false;
      this.getDevicesUnassigned();
      this.getDevicesByTenantId(this.tenantid as string);

      let closeEvent = new MouseEvent('click', { bubbles: true });
      document.querySelector('#tenant-devices-modal .close')?.dispatchEvent(closeEvent);

      Swal.fire('Success', 'Devices Assigned Successfully', 'success');
    } catch (err: any) {
      this.formSubmissionFlag = false;
      Swal.fire('Error', err.errmessage || 'Error assigning devices', 'error');
    }
  }

  devicesread(i: any) {
    this.deviceForm.patchValue(i);
    this.editPopup = true;
  }

  updateDeviceStatus(item: any) {
    item.status = item.status === 'enabled' ? 'disabled' : 'enabled';
    this.devicesService.devicesUpdateStatus(item.username, item.status).then((data: any) => {
      this.getDevicesByTenantId(this.tenantid as string);
      Swal.fire({ title: '', text: 'Device updated successfully', icon: 'success', confirmButtonText: 'Close' });
    }).catch((err: any) => {
      Swal.fire({ title: '', text: 'Error: ' + err.errmessage, icon: 'error', confirmButtonText: 'Close' });
    });
  }

  deleteDevice(i: any) {
    const dialogRef = this.viewContainer.createComponent(ConfirmationComponent);
    dialogRef.instance.visible = true;
    dialogRef.instance.action.subscribe(x => {
      if (x) {
        let device = { username: i.username, deviceid: i.deviceid };
        this.devicesService.devicesUnassign(device, true).then((data: any) => {
          if (this.tenantid !== null) this.getDevicesByTenantId(this.tenantid);
          dialogRef.instance.visible = false;
          Swal.fire({ title: '', text: 'Device Deleted Successfully', icon: 'success', confirmButtonText: 'Close' });
        }).catch((err: any) => {
          Swal.fire({ title: '', text: 'Error: ' + err.errmessage, icon: 'error', confirmButtonText: 'Close' });
        });
      }
    });
  }
}
