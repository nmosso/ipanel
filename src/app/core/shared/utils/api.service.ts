import { Injectable } from '@angular/core';
import { API_URL, ApiMethod } from './const';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }
/*
  requestLocalFastCall(api: string, method: ApiMethod, params?: string, data?: any) {
    return new Promise(async (resolve, reject) => { 
      let response;
      let errorMessage;
      console.log(`Apihttp request to:(${method}) ${API_URL}${api}`);
      const headers = { 'apikey': environment.apikey }
      let url = `${FASTAPI_URL}${api}?${params}`;
      this.http.get<any>(url,{headers})
      .subscribe({next: data => {
              console.log(`original data`)
              console.log(data)
              response = data;
              resolve(data);
          },
          error: error => {
              console.log(`Error on request`)
              errorMessage = error.message;
              console.error('There was an error!', error);
              reject(errorMessage)
          }
        });
    }).catch((err:any)=>{
      console.log(`Error: Uncaught (in promise): Both the table and dtOptions cannot be empty`)
      console.log(err)
    });
  }
  */
  requestCall(api: string, method: ApiMethod, params?: string, data?: any) {
    return new Promise(async (resolve, reject) => { 
      let response;
      let errorMessage;
      console.log(`Apihttp request to:(${method}) ${API_URL}${api}`);
      const headers = { 'apikey': environment.apikey }
      let url = `${API_URL}${api}`;
      if (params !== undefined && params.length > 0) {
        url = `${API_URL}${api}?${params}`;
      }
      this.http.get<any>(url,{headers})
      .subscribe({next: data => {
              console.log(`original data`)
              console.log(data)
              response = data;
              resolve(data);
          },
          error: error => {
              console.log(`Error on request`)
              errorMessage = error.message;
              console.error('There was an error!', error);
            reject(error)
          }
        });
    })
  }
  requestPost(api: string,  data?: any) {
    return new Promise(async (resolve, reject) => { 
      let response;
      let errorMessage;
      console.log(`Post Apihttp request to:() ${API_URL}${api}`);
     
      let headers = { 'apikey': environment.apikey,Authorization:'' }
      let url = `${API_URL}${api}`;
      console.log(`DATA`)
      console.log(data)
      
      this.http.post<any>(url,data,{headers})
      .subscribe({next: data => {
              //console.log(`original data`)
              //console.log(data)
              response = data;
              resolve(data);
          },
          error: error => {
            console.log(`Error on request`)
            errorMessage = error.message;
            console.error('There was an error!', error);
            reject(error)
          }
        });
    });
  }
  requestPut(api: string,  data?: any) {
    return new Promise(async (resolve, reject) => { 
      let response;
      let errorMessage;
      console.log(`PUT Apihttp request to:() ${API_URL}${api}`);
      const headers = { 'apikey': environment.apikey }
      let url = `${API_URL}${api}`;
      this.http.put<any>(url,data,{headers})
      .subscribe({next: data => {
              //console.log(`original data`)
              //console.log(data)
              response = data;
              resolve(data);
          },
          error: error => {
              console.log(`Error on request`)
              errorMessage = error.message;
              console.error('There was an error!', error);
            reject(error)
          }
        });
    });
  }  
  requestDelete(api: string, params?: string, data?: any) {
    return new Promise(async (resolve, reject) => { 
      let response;
      let errorMessage;
      console.log(`Delete Apihttp request to:() ${API_URL}${api}`);
      const headers = { 'apikey': environment.apikey }
      let url = `${API_URL}${api}`;
      this.http.delete<any>(url,{headers})
      .subscribe({next: data => {
              //console.log(`original data`)
              //console.log(data)
              response = data;
              resolve(data);
          },
          error: error => {
              console.log(`Error on request`)
              errorMessage = error.message;
              console.error('There was an error!', error);
            reject(error)
          }
        });
    });
  }

  handleError(err:any,self:any){
    console.log(`Error in request call:`)
    console.log(err);
return err
  }
}
