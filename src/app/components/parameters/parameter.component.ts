import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SocketService } from 'src/app/core/shared/socket.service';
import { DatePipe } from '@angular/common';
import { RolesService } from 'src/app/core/shared/services/roles.service';
import { HttpClient } from '@angular/common/http';
import { ParametersService } from './parameter.service';
import { ConfirmationComponent } from 'src/app/core/shared/components/confirmation/confirmation.component';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styleUrls: ['./parameter.component.css']
})
export class ParameterComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef

  selectedRoles:any = [];
  closeResult: string;
  userInfo:any;
  userForm: any;
  Params:any = [];

  userRoles:any = [];
  errors: any = [];
  formError: any = {};
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
    private parametersService: ParametersService,
    private viewContainer: ViewContainerRef
    ) {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
  }

  ngOnInit(): void {

    this.getParams();
    this.setForm();
  }

  trackByDeviceId(index: number, parameter: any): string {
    return parameter.parameterid;
  }

  async getParams() {
    this.parametersService.getParameters().then((data:any)=>{
      console.log(data);
      this.Params = data;
      this.userForm.patchValue(this.Params);
      console.log(this.Params);
    }).catch((err)=>{
      console.log('Error fetching parameters');
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
      dueday: new FormControl(null, [Validators.required]),
      unitprice: new FormControl(null, [Validators.required]),
      extradays: new FormControl(null, [Validators.required]),
      freeperiods: new FormControl(null, [Validators.required]),
    });
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
    formData.append('dueday', this.userForm.value.dueday);
    formData.append('unitprice', this.userForm.value.unitprice);
    formData.append('extradays', this.userForm.value.extradays);
    formData.append('freeperiods', this.userForm.value.freeperiods);


    this.parametersService.updateParameters(formData).then((res: any) => {
      if (res.status === 'success') {
        this.userForm.reset();
        this.getParams();
        this.cdr.detectChanges();
        Swal.fire({
          title: '',
          text: 'Parameters updated Successfully',
          icon: 'success',
          confirmButtonText: 'Close'
        })
      }
    }).catch(err => {
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

}