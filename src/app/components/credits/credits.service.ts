import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CreditsService {

  constructor(private http: ApiService) { }

  async getCreditsinfo(clientid: number = null, deviceid: number = null, dateStart: string = null, dateEnd: string = null) {
    return new Promise(async (resolve, reject) => { 

      let endPoint = '/v3/query/creditslist?1=1';
      endPoint += (clientid !== null) ? `&clientid=${clientid}` : '';
      endPoint += (deviceid !== null) ? `&deviceid=${deviceid}` : '';
      endPoint += (dateStart !== null) ? `&datestart=${dateStart}` : '';
      endPoint += (dateEnd !== null) ? `&dateend=${dateEnd}` : '';

      console.log(`Final Endpoint: ${endPoint}`);
      this.http.requestCall(endPoint,ApiMethod.GET).then((data:any)=>{ //getchannelsinfo
      //console.log(data);
      resolve(data.credits) //     
      }).catch((err)=>{
        console.log(`Catched`);
        console.log(err);
        reject(err.error);
      });
 
    });
  }


}