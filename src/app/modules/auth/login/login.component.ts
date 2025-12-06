import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/core/shared/socket.service';
import {AuthService} from '../services/auth.service'
import { navItems } from 'src/app/core/default-layout/_nav';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public navItems = navItems;
  loginForm = new FormGroup({
    email: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    recaptcha: new FormControl(null, [Validators.required]),
  });
  captchaResponse: string | null = null;
  isError: boolean = false;
  constructor(private authService:AuthService, private router: Router, private socket: SocketService) { }


  onSingIn(){
    const formData: any = new FormData();
    formData.append('email', this.loginForm.value.email);
    formData.append('password', this.loginForm.value.password);
    formData.append('recaptcha', this.loginForm.value.recaptcha);

    this.authService.signIn(this.formDataToJson(formData)).then((data: any) => {
      console.log(data)
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', this.loginForm.value.email);
      localStorage.setItem('name', data.name);
      localStorage.setItem('role', data.role);
      localStorage.setItem('tenantid', data.tenantid);
      this.router.navigate(['/dashboard']);
    }).catch((err:any)=>{
      console.error('Login error: ');
      console.error(JSON.stringify(err));
      this.isError = true;
      alert(err.error.errmessage);
    })
  }
  moveToForgetPassword(){
    this.router.navigate(['/reset-password']);
  }

  formDataToJson(formData: FormData): any {
    const json = {};
    formData.forEach((value, key) => {
      json[key] = value;
    });
    return json;
  }
  resolvedCaptcha(captchaResponse: string): void {
    this.captchaResponse = captchaResponse;
    this.loginForm.controls['recaptcha'].setValue(captchaResponse);  // Actualiza el valor del captcha
  }
}
