import { ApiHandlerService } from '../../core/shared/utils/api-handler.service';
import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import { Injectable } from '@angular/core';

const  EndPoint = '/tenants/parameters';
@Injectable({
  providedIn: 'root'
})
export class ParametersService {

  constructor(private http: ApiService) { }
  formDataToJson(formData: FormData): any {
    const json = {};
    formData.forEach((value, key) => {
      json[key] = value;
    });
    return json;
  }

  async getParameters() {
      return new Promise(async (resolve, reject) => { 
        let EndPoint = '/v3/query/tenantgetparams';
        this.http.requestCall(EndPoint,ApiMethod.GET).then((data:any)=>{ //getchannelsinfo
        //console.log(data);
        resolve(data) //     
        }).catch((err)=>{
          console.log(`Catched`);
          console.log(err);
          reject(err);
        });
   
      });
    }
  async updateParameters(data:any) {
    return new Promise(async (resolve, reject) => { 
      //debugger
      let EndPoint = '/v3/query/tenantsetparams';
      this.http.requestPost(EndPoint, this.formDataToJson(data)).then((data:any)=>{ //getchannelsinfo
        //console.log(data);
        resolve(data) //     
      }).catch((err:any)=> {
        console.log('Error en POST Add Client');
        console.log(err.error);
        reject(err.error);
      });
 
    });

  }
}