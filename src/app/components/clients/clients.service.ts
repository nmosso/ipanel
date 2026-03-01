import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import { Injectable } from '@angular/core';
import { da } from 'date-fns/locale';

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
        reject(err.error);
      });
 
    });

  }
  async getClientinfo(clientid: string = "") {
    return new Promise(async (resolve, reject) => {
      let endpoint = `${ENDPOINTS.clients}/${clientid}`;
      this.http.requestCall(endpoint, ApiMethod.GET).then((data: any) => { //getchannelsinfo
        console.log(data);
        resolve(data) //     
      }).catch((err) => {
        console.log(`Catched`);
        console.log(err);
        reject(err.error);
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
        reject(err.error);
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
        reject(err.error);
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
        reject(err.error);
      });
 
    });

  }

  async clientUpdateStatus(clientid: string, status: string, substatus: string = '') {
    return new Promise(async (resolve, reject) => {
      let data = {clientid,status,substatus};
      let endpoint = `${ENDPOINTS.clients}/${clientid}/status/${status}`
      this.http.requestPost(endpoint, data).then((data: any) => { //getchannelsinfo
        console.log(data);
        resolve(data.clients) //     
      }).catch((err: any) => {
        console.log('Error en POST Update Client');
        console.log(err);
        reject(err.error);
      });

    });

  }
  async getDuesList(clientid: number) {
    return new Promise(async (resolve, reject) => {
      const endpoint = `/v3/query/clientduelist?clientid=${clientid}`;
      this.http.requestCall(endpoint, ApiMethod.GET, '').then((data: any) => { //getchannelsinfo
        console.log('Dues: ', data);
       // data.dues = data.dues.sort((a: any, b: any) => b.dueid - a.dueid);
        resolve(data) //     
      }).catch((ex: any) => {
        reject(ex)
      });

    });
  }
  async getLogs(clientid: number) {
    return new Promise(async (resolve, reject) => {
      const endpoint = `/v3/query/tenantgetlogs?clientid=${clientid}`;
      this.http.requestCall(endpoint, ApiMethod.GET, '').then((data: any) => { //getchannelsinfo
        console.log('Logs: ',data);
        if (data.logs !== undefined && data.logs.length>0)
          data.logs = data.logs.sort((a: any, b: any) => b.id - a.id); 

        resolve(data) //     
      }).catch((ex: any) => {
        reject(ex)
      });

    });
  }
  async createPayment(data:any) {
    return new Promise(async (resolve, reject) => {
      let endpoint = `/v3/query/clientdueadd`
      this.http.requestPost(endpoint,data).then((resp: any) => { //getchannelsinfo
        console.log(data);
        resolve(data) //     
      }).catch((err: any) => {
        console.log('Error en POST Update Client');
        console.log(err);
        reject(err.error);
      });

    });

  }
  async deletePayment(data: any) {
    return new Promise(async (resolve, reject) => {
      let endpoint = `/v3/query/clientduedelete`
      this.http.requestPost(endpoint, data).then((resp: any) => { //getchannelsinfo
        console.log(data);
        resolve(data) //     
      }).catch((err: any) => {
        console.log('Error en POST Update Client');
        console.log(err);
        reject(err.error);
      });

    });

  }
  async getParameters() {
    return new Promise(async (resolve, reject) => {
      let EndPoint = '/v3/query/tenantgetparams';
      this.http.requestCall(EndPoint, ApiMethod.GET).then((data: any) => { //getchannelsinfo
        //console.log(data);
        resolve(data) //     
      }).catch((err) => {
        console.log(`Catched`);
        console.log(err);
        reject(err);
      });

    });
  }
  async getPartialParameters(clientid: number) {
    return new Promise(async (resolve, reject) => {
      let EndPoint = `/v3/query/clientduepreview?clientid=${clientid}`;
      this.http.requestCall(EndPoint, ApiMethod.GET).then((data: any) => { //getchannelsinfo
        //console.log(data);
        resolve(data) //     
      }).catch((err) => {
        console.log(`Catched`);
        console.log(err);
        reject(err);
      });

    });
  }
}
