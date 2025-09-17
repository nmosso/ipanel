import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {

  constructor(private http: ApiService) { }

  async astrasetallchannels() {
    return new Promise(async (resolve, reject) => {
      let url = `${ENDPOINTS.astra}/setallchannels` 
      this.http.requestPost(url).then((data:any)=>{ //getchannelsinfo
      console.log(data);
      resolve(data) //     
      }).catch((err)=>{
        console.log(`Catched`);
        console.log(err);
        reject(err);
      });
 
    });

  }
}
