import { Injectable } from '@angular/core';
import { API_URL, ApiMethod } from './const';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiHandlerService {

  constructor(private http: HttpClient) { }

  requestCall(api: string, method: ApiMethod, params?: string, data?: any) {
    let response;
    let token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const options = {headers}
    params = params == null ? '' : params;
    switch (method) {
      case ApiMethod.GET:
        if (params == '') {
          response = this.http.get(`${API_URL}${api}`, options)
            .pipe(catchError(err => this.handleError(err, this)));
        }
        else {
          response = this.http.get(`${API_URL}${api}${params}`, options)
            .pipe(catchError(err => this.handleError(err, this)));
        }
        break;
      case ApiMethod.POST:
        debugger;
        console.log(`${API_URL}`)
        response = this.http.post(`${API_URL}${api}${params}`, data, options )
          .pipe(catchError(err => this.handleError(err, this)));
        break;
      case ApiMethod.PUT:
        response = this.http.put(`${API_URL}${api}${params}`, data, options)
          .pipe(catchError(err => this.handleError(err, this)));
        break;
      case ApiMethod.DELETE:
        response = this.http.delete(`${API_URL}${api}${params}`, options)
          .pipe(catchError(err => this.handleError(err, this)));
        break;
      default:
        break;
    }

    return response;
  }


  handleError(err:any,self:any){
return err
  }
}
