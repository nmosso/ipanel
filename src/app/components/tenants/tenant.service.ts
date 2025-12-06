import { ApiHandlerService } from '../../core/shared/utils/api-handler.service';
import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TenantsService {

  constructor(private http: ApiService) { }
  formDataToJson(formData: FormData): any {
    const json = {};
    formData.forEach((value, key) => {
      json[key] = value;
    });
    return json;
  }

  async getUsers() {
      return new Promise(async (resolve, reject) => { 
        let endPoint = ENDPOINTS.tenants
        this.http.requestCall(endPoint,ApiMethod.GET).then((data:any)=>{ //getchannelsinfo
        //console.log(data);
        resolve(data) //     
        }).catch((err)=>{
          console.log(`Catched`);
          console.log(err);
          reject(err);
        });
   
      });
    }
  async createUser(data:any) {
    return new Promise(async (resolve, reject) => { 
      //debugger
      let endPoint = ENDPOINTS.tenants
      this.http.requestPost(endPoint, this.formDataToJson(data)).then((data:any)=>{ //getchannelsinfo
        //console.log(data);
        resolve(data) //     
      }).catch((err:any)=> {
        console.log('Error en POST Add Client');
        console.log(err.error);
        reject(err.error);
      });
 
    });

  }
  async editUser(data: any) {
    return new Promise(async (resolve, reject) => { 
      let endPoint = `${ENDPOINTS.tenants}/${data.get('tenantid')}`;
      this.http.requestPut(endPoint, this.formDataToJson(data)).then((data:any)=>{ //
        //console.log(data);
        resolve(data) //     
      }).catch((err:any)=> {
        console.log('Error en POST Update Client');
        console.log(err.error);
        reject(err.error);
      });
 
    });

  }
  async deleteUser(data: any) {
    return new Promise(async (resolve, reject) => {
      let endPoint = `${ENDPOINTS.tenants}/${data.get('tenantid')}`;
      this.http.requestDelete(endPoint, this.formDataToJson(data)).then((data: any) => { //
        console.log(data);
        resolve(data) //  

      }).catch((err: any) => {
        console.log('Error en Delete Add Client');
        console.log(err);
        reject(err);
      });
    });
  }
}
