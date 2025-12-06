import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {

  constructor(private http: ApiService) { }



  async getDevicesinfo(clientid: number = null, allDevicesInfo:boolean) {
    return new Promise(async (resolve, reject) => { 
      let noclients = 'true';
      if (allDevicesInfo !== true) noclients = 'false';
      let endPoint = ENDPOINTS.devices;
      if (clientid !== null) {
        endPoint = `${ENDPOINTS.devices}?clientid=${clientid}&noclients=${noclients}`;
      } else {
        endPoint = `${ENDPOINTS.devices}?noclients=${noclients}`;
      }
      this.http.requestCall(endPoint,ApiMethod.GET).then((data:any)=>{ //getchannelsinfo
      //console.log(data);
      resolve(data.devices) //     
      }).catch((err)=>{
        console.log(`Catched`);
        console.log(err);
        reject(err.error);
      });
 
    });
  }
  async devicesAdd(formData) {
    return new Promise(async (resolve, reject) => { 
      //debugger
      let params = '';
      this.http.requestPost(ENDPOINTS.devices,formData).then((data:any)=>{ //getchannelsinfo
        //console.log(data);
        resolve(data.devices) //     
      }).catch((err:any)=> {
        console.log('Error en POST Add Client');
        console.log(err.error);
        reject(err.error);
      });
 
    });

  }
  async devicesUpdate(formData) {
    return new Promise(async (resolve, reject) => { 
      let params = '';
      this.http.requestPut(ENDPOINTS.devices,formData).then((data:any)=>{ //
        //console.log(data);
        resolve(data.devices) //     
      }).catch((err:any)=> {
        console.log('Error en POST Update Client');
        console.log(err.error);
        reject(err.error);
      });
 
    });

  }
  async devicesUpdateStatus(deviceid:string,status:string) {
    return new Promise(async (resolve, reject) => {
      let endpoint = `${ENDPOINTS.devices}/${deviceid}/status/${status}`;
      this.http.requestPut(endpoint).then((data: any) => { //
        //console.log(data);
        resolve(data) //     
      }).catch((err: any) => {
        console.log('Error en POST Update Client');
        console.log(err.error);
        reject(err.error);
      });

    });

  }
  async devicesDelete(formData) {
    
    return new Promise(async (resolve, reject) => { 
      let endpoint = `${ENDPOINTS.devices}/${formData.username}`
      this.http.requestDelete(endpoint,ApiMethod.DELETE,'').then((data:any)=>{ //
        console.log(data);
        resolve(data.devices) //  
           
      }).catch((err:any)=> {
        console.log('Error en Delete Add Client');
        console.log(err);
        reject(err.error);
      });
 
    });

  }

  async getClientsinfo(params: string = "") {
    console.log(`getClientsinfo called with params: ${params}`);
    return new Promise(async (resolve, reject) => {
      this.http.requestCall(ENDPOINTS.clients, ApiMethod.GET, params).then((data: any) => { // 
        console.log(data);
        resolve(data.clients) //     
      }).catch((err) => {
        console.log(`Catched`);
        console.log(err);
        reject(err.error);
      });

    });

  }

  async getClientbyClientId(clientid:string) {
    console.log(`getClientbyClientId called with params: ${clientid}`);
    let endpoint = `${ENDPOINTS.clients}?clientid=${clientid}`;
    return new Promise(async (resolve, reject) => {
      this.http.requestCall(endpoint, ApiMethod.GET).then((data: any) => { // 
        console.log(data);
        resolve(data.clients) //     
      }).catch((err) => {
        console.log(`Catched`);
        console.log(err);
        reject(err.error);
      });

    });

  }
  async getBrandList(params: string = "") {
    console.log(`getBrandList called with params: ${params}`);
    return new Promise(async (resolve, reject) => {
      this.http.requestCall(ENDPOINTS.brands, ApiMethod.GET, params).then((data: any) => { // 
        console.log(data);
        resolve(data.brands) //     
      }).catch((err) => {
        console.log(`Catched`);
        console.log(err);
        reject(err.error);
      });

    });

  }

  async devicesPreAdd(clientid) {
    return new Promise(async (resolve, reject) => {
      //debugger
      let params = '';
      this.http.requestPost(`${ENDPOINTS.devices}/preadd`, {clientid}).then((data: any) => { //getchannelsinfo
        console.log(data);
        resolve(data.devices[0]) //     
      }).catch((err: any) => {
        console.log('Error en POST Add Client');
        console.log(err);
        reject(err.error);
      });

    });

  }
  async devicesBarcodeExists(barcode) {
    return new Promise(async (resolve, reject) => {
      //debugger
      if (barcode in [null, undefined, ''] || barcode.length < 4) {
        resolve({ barcode: '' });
        return;
      }
      let params = '';
      this.http.requestCall(`${ENDPOINTS.devices}/barcode/${barcode}`,ApiMethod.GET).then((data: any) => { //getchannelsinfo
        console.log(data);
        resolve(data) //     
      }).catch((err: any) => {
        console.log('Error en GET Add Client');
        console.log(err);
        reject(err.error);
      });

    });

  }
  async devicesUsernameExists(username) {
    return new Promise(async (resolve, reject) => {
      //debugger
      let params = '';
      this.http.requestCall(`${ENDPOINTS.devices}/username/${username}`, ApiMethod.GET).then((data: any) => { //getchannelsinfo
        console.log(data);
        resolve(data) //     
      }).catch((err: any) => {
        console.log('Error en POST Add Client');
        console.log(err);
        reject(err.error);
      });

    });

  }
}
