import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SocketService } from 'src/app/core/shared/socket.service';
import { DatePipe } from '@angular/common';
import { RolesService } from 'src/app/core/shared/services/roles.service';
import { HttpClient } from '@angular/common/http';
import { TenantsService } from './tenant.service';
import { ConfirmationComponent } from 'src/app/core/shared/components/confirmation/confirmation.component';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-tenant',
  templateUrl: './tenant.component.html',
  styleUrls: ['./tenant.component.css']
})
export class TenantComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef

  selectedRoles:any = [];
  closeResult: string;
  userInfo:any;
  userForm: any;
  allUsers:any = [];
  userRoles:any = [];
  errors: any = [];
  formError: any = {};
  tableColumns:[
    'Id',
    'User Name',
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
  userImage: string;
  serverError: boolean;
  popUpShowHideFlag: boolean;
  editPopup: boolean;
  formSubmissionFlag: boolean = false;
  constructor(
    private roleService: RolesService,
    private socket: SocketService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private tenantsService: TenantsService,
    private viewContainer: ViewContainerRef
    ) {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
  }

  ngOnInit(): void {
    this.getUserList();
    //this.getUserRoleList();
    this.setForm();
  }

  trackByDeviceId(index: number, tenant: any): string {
    return tenant.tenantid;
  }

  async getUserList() {
    this.tenantsService.getUsers().then((data:any)=>{
      this.allUsers = data;
      console.log(this.allUsers);
    }).catch((err)=>{
      console.log('Error fetching tenants');
      console.log(err);
    });
  }

  getUserRoleList() {
    this.userRoles = [
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
    this.userForm = new FormGroup({
      tenantid: new FormControl(null),
      email: new FormControl(null, [Validators.required]),
      identityid: new FormControl(null),
      tenant: new FormControl(null, [Validators.required]),
      location: new FormControl(null, [Validators.required]),
      client: new FormControl(null, [Validators.required]),
      status: new FormControl(),
      loginStatus: new FormControl(),
      phone: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      password_confirmation: new FormControl(null, [Validators.required]),
    });
  }
  updateStatus(item) {

    item.userStatus = item.userStatus ? 0 : !item.userStatus;
    this.userForm.patchValue({ 'status': item.userStatus });
    this.userForm.patchValue(item)
    this.update();

  }

  updateLoginStatus(item) {
    if(item.loginStatus){item.loginStatus = 0}else{item.loginStatus = 1};
    this.userForm.patchValue({ 'loginStatus': item.loginStatus });
    this.userForm.patchValue(item)
    this.update();
  }

  adduser() {
    this.userForm.reset();
    this.editPopup = false;
  }
  create() {
    if (!this.validForm()) {
      return
    }
    this.formSubmissionFlag  = true;
    const formData: any = new FormData();
//   formData.append('countryId', 1);
//formData.append('roleId', this.userForm.value.roleId);
    formData.append('tenant', this.userForm.value.tenant);
    formData.append('client', this.userForm.value.client);
    formData.append('email', this.userForm.value.email);
    formData.append('location', this.userForm.value.location);
    formData.append('password', this.userForm.value.password);
    formData.append('password_confirmation', this.userForm.value.password_confirmation);
    formData.append('phone', this.userForm.value.phone);
//    formData.append('userImage', this.userForm.value.userImage);
    this.userForm.reset();
    this.closeModal.nativeElement.click();
    this.formSubmissionFlag  = false;
    // Swal.fire({
    //   title: '',
    //   text: 'User created Successfully',
    //   icon: 'success',
    //   confirmButtonText: 'Close'
    // })
    this.tenantsService.createUser(formData).then(async (res: any) => {
      if (res.status === 'success') {
        this.userForm.reset();
        this.closeModal.nativeElement.click();
        this.formSubmissionFlag  = false;
        this.getUserList();
        this.cdr.detectChanges();
        Swal.fire({
          title: '',
          text: 'User created Successfully',
          icon: 'success',
          confirmButtonText: 'Close'
        })
      }
    }, err => {
      console.log(err);
      Swal.fire({
        title: 'Error!',
        text: err.errmessage,
        icon: 'error',
        confirmButtonText: 'Close'
      })
      this.serverError = true;
    })
  }
  read(i: any) {
    this.userForm.patchValue(i);
    this.editPopup = true;
    // setTimeout(() => {
    //   this.popUpShowHideFlag = !this.popUpShowHideFlag;
    // }, 500);
  }
  update() {
    this.formSubmissionFlag  = true;
    const formData: any = new FormData();
    formData.append('tenantid', this.userForm.value.tenantid);
    formData.append('identityid', this.userForm.value.identityid);
    formData.append('tenant', this.userForm.value.tenant);
    formData.append('email', this.userForm.value.email);
    formData.append('client', this.userForm.value.client);
    formData.append('location', this.userForm.value.location);
    formData.append('phone', this.userForm.value.phone);
    formData.append('status', this.userForm.value.status);
    formData.append('loginstatus', this.userForm.value.loginstatus);
    this.formSubmissionFlag  = false;
    this.closeModal.nativeElement.click();
    // Swal.fire({
    //   title: '',
    //   text: 'User updated Successfully',
    //   icon: 'success',
    //   confirmButtonText: 'Close'
    // });
    this.tenantsService.editUser(formData).then((res: any) => {
      if (res.status === 'success') {
        this.userForm.reset();
        this.editPopup = false;
        this.formSubmissionFlag  = false;
        this.closeModal.nativeElement.click();
        this.getUserList();
        this.cdr.detectChanges();
        Swal.fire({
          title: '',
          text: 'User updated Successfully',
          icon: 'success',
          confirmButtonText: 'Close'
        })
      }
    }).catch(err => {
      console.log(err);
      this.editPopup = false;
      Swal.fire({
        title: 'Error!',
        text: err.errmessage,
        icon: 'error',
        confirmButtonText: 'Close'
      })
      this.serverError = true;
    })
  }
  delete(i: any) {
    const dialogRef = this.viewContainer.createComponent(ConfirmationComponent)
    dialogRef.instance.visible = true;
    dialogRef.instance.action.subscribe(x => {
      if (x) {
        // this.usersService.deleteUser(i.user_id)?.subscribe((res: any) => {
        //   if (res.status === 'success') {
        //     dialogRef.instance.visible = false;
        //     Swal.fire({
        //       title: '',
        //       text: 'User Deleted Successfully',
        //       icon: 'success',
        //       confirmButtonText: 'Close'
        //     })
        //   }
        // })
        dialogRef.instance.visible = false;
        Swal.fire({
          title: '',
          text: 'User Deleted Successfully',
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
    if (!this.userForm.value.email) {
      this.errors.push('email');
      this.formError.errorForEmail = 'Email is required';
      validFlag = false;
    }
    if (!this.userForm.value.password) {
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
        this.userForm.get('userImage').setValue(file);
      } else {
        this.userForm.get('userImage').setValue(file);
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
    this.userForm.get('userImage').setValue([]);
    this.changedFileName = '';
    this.userImage = '';
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
