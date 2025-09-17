import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SocketService } from 'src/app/core/shared/socket.service';
import { DatePipe } from '@angular/common';
import { RolesService } from 'src/app/core/shared/services/roles.service';
import { HttpClient } from '@angular/common/http';
import { ClientsService } from './clients.service';
import { ConfirmationComponent } from 'src/app/core/shared/components/confirmation/confirmation.component';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef

  selectedRoles:any = [];
  closeResult: string;
  clientsInfo:any;
  clientsForm: any;
  allClients:any = [];
  clientsRoles:any = [];
  errors: any = [];
  formError: any = {};
  tableColumns:[
    'Id',
    'Clients Name',
    'Email',
    'Phone',
    'Status',
    'Login Status',
    'Actions'
  ];
  message: string;
  imagePath: any;
  createFormImageUrl: string | ArrayBuffer;
  editFormImageUrl: string | ArrayBuffer;
  changedFileName: string;
  clientsImage: string;
  serverError: boolean;
  popUpShowHideFlag: boolean;
  editPopup: boolean;
  formSubmissionFlag: boolean = false;
  constructor(
    private roleService: RolesService,
    private socket: SocketService,
    private http: HttpClient,
    private clientsService: ClientsService,
    private viewContainer: ViewContainerRef
    ) {
    this.clientsInfo = JSON.parse(localStorage.getItem('clientsInfo'));
  }

  ngOnInit(): void {
    this.getClientsList();
    this.getClientsRoleList();
    this.setForm();
  }

  async getClientsList() {
    this.allClients = [
      {
        clients_id: '1',
        email:'john@gmail.com',
        password:'123456',
        phone:'+92301789658',
        gender:'male',
        country:'Pakistan',
        clientsStatus:1,
        loginStatus:0,
        clientsname:'john doe'
      },
      {
        clients_id: '2',
        email:'suzan@gmail.com',
        password:'123456',
        phone:'+92693569314',
        country:'Pakistan',
        gender:'male',
        clientsStatus:1,
        loginStatus:0,
        clientsname:'Suzan Miler'
      }
    ];
  }
  getClientsRoleList() {
    this.clientsRoles = [
      {
        id:1,
        roleName:'Super Admin'
      },
      {
        id:2,
        roleName:'Company Admin'
      }
    ]
  }
  setForm() {
    //debugger
    this.clientsForm = new FormGroup({
      clients_id: new FormControl(null),
      roleId: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required]),
      clientsname: new FormControl(null, [Validators.required]),
      clientsStatus: new FormControl(),
      loginStatus: new FormControl(),
      gender: new FormControl(),
      phone: new FormControl(null, [Validators.required]),
      clientsImage: new FormControl(['']),
      password: new FormControl(null, [Validators.required]),
      password_confirmation: new FormControl(null, [Validators.required]),
    });
  }
  updateStatus(item) {

    item.clientsStatus = item.clientsStatus ? 0 : !item.clientsStatus;
    this.clientsForm.patchValue({ 'clientsStatus': item.clientsStatus });
    this.clientsForm.patchValue(item)
    this.update();

  }

  updateLoginStatus(item) {
    if(item.loginStatus){item.loginStatus = 0}else{item.loginStatus = 1};
    this.clientsForm.patchValue({ 'loginStatus': item.loginStatus });
    this.clientsForm.patchValue(item)
    this.update();
  }


  create() {
    if (!this.validForm()) {
      return
    }
    this.formSubmissionFlag  = true;
    const formData: any = new FormData();
    formData.append('countryId', 1);
    formData.append('companyId', 1);
    formData.append('roleId', this.clientsForm.value.roleId);
    formData.append('email', this.clientsForm.value.email);
    formData.append('password', this.clientsForm.value.password);
    formData.append('password_confirmation', this.clientsForm.value.password_confirmation);
    formData.append('clientsname', this.clientsForm.value.clientsname);
    formData.append('phone', this.clientsForm.value.phone);
    formData.append('clientsImage', this.clientsForm.value.clientsImage);
    this.clientsForm.reset();
    this.closeModal.nativeElement.click();
    this.formSubmissionFlag  = false;
    Swal.fire({
      title: '',
      text: 'Clients created Successfully',
      icon: 'success',
      confirmButtonText: 'Close'
    })
    // this.clientsService.createClients(formData)?.subscribe(async (res: any) => {
    //   if (res.status === 'success') {
    //     this.clientsForm.reset();
    //     this.closeModal.nativeElement.click();
    //     this.formSubmissionFlag  = false;
    //     Swal.fire({
    //       title: '',
    //       text: 'Clients created Successfully',
    //       icon: 'success',
    //       confirmButtonText: 'Close'
    //     })
    //   }
    // }, err => {
    //   console.log(err);
    //   Swal.fire({
    //     title: 'Error!',
    //     text: 'There is an error from backend side.',
    //     icon: 'error',
    //     confirmButtonText: 'Close'
    //   })
    //   this.serverError = true;
    // })
  }
  read(i: any) {
    this.clientsForm.patchValue(i);
    this.editPopup = true;
    // setTimeout(() => {
    //   this.popUpShowHideFlag = !this.popUpShowHideFlag;
    // }, 500);
  }
  update() {
    this.formSubmissionFlag  = true;
    const formData: any = new FormData();
    formData.append('clients_id', this.clientsForm.value.clients_id);
    formData.append('countryId', 1);
    formData.append('companyId', 1);
    formData.append('roleId', this.clientsForm.value.roleId);
    formData.append('email', this.clientsForm.value.email);
    formData.append('clientsname', this.clientsForm.value.clientsname);
    formData.append('phone', this.clientsForm.value.phone);
    formData.append('clientsImage', this.clientsForm.value.clientsImage);
    formData.append('clientsStatus', this.clientsForm.value.clientsStatus);
    formData.append('loginStatus', this.clientsForm.value.loginStatus);
    this.formSubmissionFlag  = false;
    this.closeModal.nativeElement.click();
    Swal.fire({
      title: '',
      text: 'Clients updated Successfully',
      icon: 'success',
      confirmButtonText: 'Close'
    });
    // this.clientsService.editClients(formData)?.subscribe((res: any) => {
    //   if (res.status === 'success') {
    //     this.formSubmissionFlag  = false;
    //     this.closeModal.nativeElement.click();
    //     Swal.fire({
    //       title: '',
    //       text: 'Clients updated Successfully',
    //       icon: 'success',
    //       confirmButtonText: 'Close'
    //     })
    //   }
    // })
  }
  delete(i: any) {
    const dialogRef = this.viewContainer.createComponent(ConfirmationComponent)
    dialogRef.instance.visible = true;
    dialogRef.instance.action.subscribe(x => {
      if (x) {
        // this.clientsService.deleteClients(i.clients_id)?.subscribe((res: any) => {
        //   if (res.status === 'success') {
        //     dialogRef.instance.visible = false;
        //     Swal.fire({
        //       title: '',
        //       text: 'Clients Deleted Successfully',
        //       icon: 'success',
        //       confirmButtonText: 'Close'
        //     })
        //   }
        // })
        dialogRef.instance.visible = false;
        Swal.fire({
          title: '',
          text: 'Clients Deleted Successfully',
          icon: 'success',
          confirmButtonText: 'Close'
        })
      }
    })
  }
  validForm() {
    this.errors = [];
    this.formError = {};
    let validFlag = true;
    if (!this.clientsForm.value.email) {
      this.errors.push('email');
      this.formError.errorForEmail = 'Email is required';
      validFlag = false;
    }
    if (!this.clientsForm.value.password) {
      this.errors.push('password');
      this.formError.errorForPassword = 'Password is required';
      validFlag = false;
    }
    return validFlag;
  }













  //  FILE UPLOAD FUNCTIONS

  selectFile(e, formType) {

    let file = e.target.files[0];
    let ext: string[] = file.type.split('/');
    if (file.type === 'application/pdf' || ext[0] === 'video' || ext[0] === 'image') {
      if (formType == 'createForm') {
        this.clientsForm.get('clientsImage').setValue(file);
      } else {
        this.clientsForm.get('clientsImage').setValue(file);
      }
      this.showImage(file, formType)
    } else {
      e.stopPropagation();
    }
  }
  showImage(file, formType) {
    const mimeType = file.type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }

    const reader = new FileReader();
    this.imagePath = file;
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      if (formType == 'createForm') {
        this.createFormImageUrl = reader.result;
      } else {
        this.editFormImageUrl = reader.result;
      }
    }
  }
  onRemoveFile(e, formType) {
    e.value = '';
    this.clientsForm.get('clientsImage').setValue([]);
    this.changedFileName = '';
    this.clientsImage = '';
    if (formType == 'createForm') {
      this.createFormImageUrl = '';
    } else {
      this.editFormImageUrl = '';
    }
  }
  getFileName(url) {
    if (typeof url == 'string') {
      let array = url.split('display/');
      return array[1];
    }
  }
  focusOnInput(e) {
    setTimeout(() => {
      e?.focus();
    }, 200);
  }

}
