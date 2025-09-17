import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators,FormsModule  } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ViewContainerRef } from '@angular/core';
import Swal from 'sweetalert2';
import { MonitoringService } from './monitoring.service';

@Component({
  selector: 'app-client',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css'],
})
export class MonitoringComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef;

  dtOptions: DataTables.Settings = {};
  iframeUrl: string = 'https://xastra.xisrv.xyz'; // Cambia esto por la URL que quieras cargar
  //safeUrl: SafeUrlPipe;
  role:string;
  constructor(
    private http: HttpClient,
    private monitoringService: MonitoringService,
    private viewContainer: ViewContainerRef
    
  ) {
    //this.clientInfo = JSON.parse(localStorage.getItem('clientInfo'));
    let accessToken = localStorage.getItem('token') || ''
    this.iframeUrl = `https://xastra.xisrv.xyz?token=${accessToken}`
    this.role = localStorage.getItem('role');
  }

  ngOnInit(): void {

  }

  async astrasetallchannels() {
    this.monitoringService.astrasetallchannels().then((channels: any) => { //getchannelsinfo
      //debugger
      console.log(`Loaded Channels`)
      //this.cdr.markForCheck();
    }).catch((err: any) => {
      console.log(`Error Loaded Channels`)
      console.log(err);
    })

  }
}
