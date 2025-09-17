import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(private http: ApiService) { }
  async getnewUserExists(clientid: string) {
    return new Promise(async (resolve, reject) => {
      const endpoint = `${ENDPOINTS.col_clientexists}/${clientid}`
      this.http.requestCall(endpoint, ApiMethod.GET, '').then((data: any) => { //getchannelsinfo
        console.log(data);
        resolve(data) //     
      }).catch((ex: any) => {
        reject(ex)
      });

    });
  }
  async getClientsinfo(params:string="") {
    return new Promise(async (resolve, reject) => { 
      this.http.requestCall(ENDPOINTS.clients,ApiMethod.GET,params).then((data:any)=>{ //getchannelsinfo
      console.log(data);
      resolve(data.clients) //     
      }).catch((err)=>{
        console.log(`Catched`);
        console.log(err);
        reject(err);
      });
 
    });

  }
  async clientAdd(formData) {
    return new Promise(async (resolve, reject) => { 
      //debugger
      let params = '';
      this.http.requestPost(ENDPOINTS.clients,formData).then((data:any)=>{ //getchannelsinfo
        console.log(data);
        resolve(data.clients) //     
      }).catch((err:any)=> {
        console.log('Error en POST Add Client');
        console.log(err);
        reject(err);
      });
 
    });

  }
  async clientUpdate(formData) {
    return new Promise(async (resolve, reject) => { 
      let params = '';
      this.http.requestPut(ENDPOINTS.clients,formData).then((data:any)=>{ //getchannelsinfo
        console.log(data);
        resolve(data.clients) //     
      }).catch((err:any)=> {
        console.log('Error en POST Update Client');
        console.log(err);
        reject(err);
      });
 
    });

  }
  async clientDelete(formData) {
    return new Promise(async (resolve, reject) => { 
      let endpoint = `${ENDPOINTS.clients}/${formData.clientid}`
      this.http.requestDelete(endpoint,ApiMethod.DELETE,'').then((data:any)=>{ //getchannelsinfo
        console.log(data);
        resolve(data.clients) //  
           
      }).catch((err:any)=> {
        console.log('Error en Delete Add Client');
        console.log(err);
        reject(err);
      });
 
    });

  }
}
