import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators,FormsModule  } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ViewContainerRef } from '@angular/core';
import Swal from 'sweetalert2';
import {  NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmationComponent } from '../../core/shared/components/confirmation/confirmation.component';
import { RolesService } from '../../core/shared/services/roles.service';
import { CreditsService } from './credits.service';
import { ClientsService } from '../clients/clients.service';
import { DevicesService } from '../devices/devices.service';

import { ActivatedRoute, TitleStrategy } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, of, filter, tap } from 'rxjs';
import { Credit } from './credits-model';
//import { CreditsFormComponent } from './credits-form/credits-form.component';


@Component({
  selector: 'app-client',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.css'],
})
export class CreditsComponent implements OnInit {
  //@ViewChild(CreditsFormComponent) private creditsFormComponent: CreditsFormComponent;

  model: NgbDateStruct;
  
  dtOptions: DataTables.Settings = {
    pageLength: 100
  };
  selectedRoles: any = [];
  closeResult: string;
  clientInfo: any;
  creditForm: any;
  allCredits: Credit[] = [];
  allFilteredCredits: Credit[] = [];
  role: string = '';
  
  allClients:any = [];
  allTenants:any = [];
  clientRoles: any = [];
  allBrands: any = [];
  statusList: any = ['enabled','disabled'];
  planList:any = [{id:'Basic',name:'Basic'}]
  userRoles : any = [];
  clientFilters:string='';
  errors: any = [];
  formError: any = {};
  clientname:string='';
  tableColumns: [
    'Id',
    'Nombre de Usuario',
    'Correo ElectrÃ³nico',
    'TelÃ©fono',
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

  allCreditsInfo: boolean = false;

  intervalId!: number;


  constructor(
     private zone: NgZone,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private creditsService: CreditsService,
    private clientsService: ClientsService,
    private devicesService: DevicesService,
    private viewContainer: ViewContainerRef,
    private cdr: ChangeDetectorRef
  ) {
    this.role = sessionStorage.getItem('role');
    console.log(`Role: ${this.role}`);
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
    this.role = sessionStorage.getItem('role');
    this.getCreditsList();
    this.getBrandsList();
    this.getClientList();
    this.getTenantsList();
    this.setForm();
  }
async getStatusList() {
    this.statusList = [];
}
  async getCreditsList() {
    
    this.creditsService.getCreditsinfo().then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allCredits = data.slice();
      this.allFilteredCredits = data.slice();
    });
  }

  updateCreditsInfoStatus() {
    console.log(`updateCreditsInfoStatus`);
    //this.allCreditsInfo = !this.allCreditsInfo;
    console.log(`allCreditsInfo: ${this.allCreditsInfo}`);
    this.allFilteredCredits = this.allFilteredCredits.slice(0,0);
    //this.filteredCredits.push(...newArray);
    if (this.allCreditsInfo) {
      this.safeReplaceCredits(this.allCredits.filter(d => d.clientid == null));
      //this.allFilteredCredits.push(...this.allCredits.filter(d => d.clientid == null));
    } else {
      this.safeReplaceCredits(this.allCredits.slice(0, this.allCredits.length));
      //this.allFilteredCredits = (this.allCredits.slice(0, this.allCredits.length));
    }
    this.cd.detectChanges();
    console.log(`allFilteredCredits: ${this.allFilteredCredits.length}`);
    console.log(this.allFilteredCredits);
    // console.log(`allCreditsInfo: ${this.allCreditsInfo}`);
    // this.creditsService.getCreditsinfo(null, this.allCreditsInfo).then((data: any) => { //getchannelsinfo
    //   console.log(data)
    //   this.allCredits = data;
    // });
  }

  // funciÃ³n segura para reemplazar la lista
  async safeReplaceCredits(newList: any[]) {
    console.log('safeReplaceCredits START', {
      oldLen: this.allFilteredCredits?.length,
      newLen: newList?.length
    });

    // 1) detect duplicates (debug)
    const ids = newList.map(d => d && d.creditid);
    const dup = ids.filter((v, i, a) => v != null && a.indexOf(v) !== i);
    if (dup.length) {
      console.warn('safeReplaceCredits: duplicate creditid found:', dup);
    }

    // 2) MUTAR el array existente para evitar reuso por posiciÃ³n
    // Esto hace que Angular retire nodos viejos antes de insertar nuevos.
    this.zone.run(() => {
      try {
        // vaciar primero (Angular removerÃ¡ nodos existentes)
        this.allFilteredCredits.length = 0;
      } catch (e) {
        console.warn('safeReplaceCredits: error clearing array', e);
        this.allFilteredCredits = [];
      }
    });

    // 3) dar un micro-tick para que Angular aplique el vaciado y estabilice el DOM
    await Promise.resolve(); // microtask
    // opcional: un small timeout si tu app usa virtual-scroller con views muy costosas
    // await new Promise(r => setTimeout(r, 0));

    // 4) push de los nuevos elementos (no reasignar la referencia)
    this.zone.run(() => {
      try {
        this.allFilteredCredits.push(...(newList || []));
      } catch (e) {
        // fallback por si push falla
        this.allFilteredCredits = Array.isArray(newList) ? [...newList] : [];
      }
    });

    // 5) Si usÃ¡s virtual scroll, forzÃ¡ el refresh / checkViewportSize
    setTimeout(() => {
      try {
        // this.viewport?.checkViewportSize?.();
        // si usÃ¡s ngx-virtual-scroller: this.virtualScroller?.refresh?.();
      } catch (e) {
        console.warn('safeReplaceCredits: viewport refresh error', e);
      }
      // 6) Evitar llamar detectChanges() immediately en el mismo tick,
      // sino Angular intentarÃ¡ reconciliar mientras las vistas aÃºn se estÃ¡n actualizando.
      try {
        this.cd.detectChanges();
      } catch (e) {
        // si falla, lo silenciamso y dejamos que Angular haga su ciclo naturalmente
        console.warn('safeReplaceCredits: detectChanges() failed (ignored)', e);
      }
    }, 0);

    console.log('safeReplaceCredits DONE', { nowLen: this.allFilteredCredits.length });
  }


  async getClientList() {

    this.clientsService.getClientsinfo(this.clientFilters).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allClients = data;
    });
  }


  async getTenantsList() {

    this.devicesService.getTenantsinfo(this.clientFilters).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allTenants = data;
    });
  }

  async getBrandsList() {
    this.devicesService.getBrandList(this.clientFilters).then((data: any) => { //getchannelsinfo
      console.log(data)
      this.allBrands = data;
    });
    
  }

  trackByCreditId(index: number, credit: any): string {
    return credit.creditid;
  }


  async setForm(isnew: boolean = false) {
    this.creditForm = new FormGroup({
      creditid: new FormControl(0),
      tenantid: new FormControl('tenant2', [Validators.required]),
      clientid: new FormControl(''),
      brand: new FormControl('', [Validators.required]),
      barcode: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl(''),
      location: new FormControl(''),
      status: new FormControl('enabled'),
      state: new FormControl('new'),
      obs: new FormControl(''),
    });


  }

  
  /* updateStatus(item) {
    item.status = item.status === 'enabled' ? 'disabled' : 'enabled';
    this.creditForm.patchValue({ 'status': item.status });
    this.creditForm.patchValue(item);
    this.creditsService.creditsUpdateStatus(item.username,item.status).then((data: any) => {
      this.formSubmissionFlag = false;
      this.getCreditsList();
      this.cdr.detectChanges();
      Swal.fire({
        title: '',
        text: 'Credit updated Successfully',
        icon: 'success',
        confirmButtonText: 'Close'
      });

    }).catch((err: any) => {
      this.formSubmissionFlag = false;
      Swal.fire({
        title: '',
        text: 'Error al modificar al Equipo: ' + err.errmessage,
        icon: 'error',
        confirmButtonText: 'Close'
      });

    });
  } */


  read(i: any) {
    this.creditForm.patchValue(i);
    this.editPopup = true;
  }

  newCredit() {
    this.editPopup = false;
    this.creditForm.reset();
  }
/* 
  delete(i: any) {
    const dialogRef = this.viewContainer.createComponent(ConfirmationComponent);
    dialogRef.instance.visible = true;
    dialogRef.instance.action.subscribe(x => {
      if (x) {
        let credit = { creditid:i.creditid, clientid:i.clientid };
        this.creditsService.creditsUnassign(credit).then((data:any)=>{ 
          this.getCreditsList();
          this.cdr.detectChanges();
          dialogRef.instance.visible = false;
                  Swal.fire({
                    title: '',
                    text: 'Equipo eliminado correctamente',
                    icon: 'success',
                    confirmButtonText: 'Close'
                  });
        }).catch((err: any) => {
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
  } */
}
