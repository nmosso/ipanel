import { API_ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiHandlerService } from '../../core/shared/utils/api-handler.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(private http: ApiHandlerService) { }

  getClients() {
    return this.http.requestCall(API_ENDPOINTS.clients,ApiMethod.GET,'')
  }

  deleteClients(i:any) {
    return this.http.requestCall(API_ENDPOINTS.deleteClients,ApiMethod.GET,i)
  }

  editClients(data:any) {
    return this.http.requestCall(API_ENDPOINTS.editClients,ApiMethod.POST,'',data)
  }

  createClients(data:any) {
    return this.http.requestCall(API_ENDPOINTS.createClients,ApiMethod.POST,'',data)
  }
}
