import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/shared/utils/api.service';

import { API_ENDPOINTS, ApiMethod } from '../../../core/shared/utils/const';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: ApiService) { }

  signIn(data:any) {
    //return this.http.requestCall(API_ENDPOINTS.logIn,ApiMethod.POST,'',data)
    //debugger;
    return this.http.requestPost(API_ENDPOINTS.logIn,data);
    
  }

  resetPassword(info: any, token: any) {
    //return this.http.requestCall(API_ENDPOINTS.resetPassword,ApiMethod.POST,token,data)
    return new Promise(async (resolve, reject) => {
      let data = {
        ...info,
        token: token
      }
      let endpoint = `/users/resetpassword`
      this.http.requestPost(endpoint, data).then((data: any) => {
        resolve(data) //
      }).catch((err: any) => {
        console.log('Error en POST Reset password');
        console.log(err);
        reject(err);
      })
    });
  }
  forgetPassword(data: any) {
    //return this.http.requestCall(API_ENDPOINTS.resetPassword,ApiMethod.POST,token,data)
    return new Promise(async (resolve, reject) => {
      let endpoint = `/users/resetpasswordsendemail`
      this.http.requestPost(endpoint, data).then((data: any) => {
        resolve(data) //
      }).catch((err: any) => {
        console.log('Error en POST Reset password');
        console.log(err);
        reject(err);
      })
    });
  }


  signUp(data:any) {
    //return this.http.requestCall(API_ENDPOINTS.signUp,ApiMethod.POST,'',data)
  }

  logout(){
    localStorage.clear();
  }

}
