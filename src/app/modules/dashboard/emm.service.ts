import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface EmmResponse {
    meta: {
        server_id: string;
        tz: string;
        from: string;  // ISO
        to: string;    // ISO
        bucket_sec: number;
        generated_at: string; // ISO
    };
    readers: Array<{ id: string; name: string }>;
    series: Array<{
        reader_id: string;
        points: [string, number][]; // [timestampISO, qtty]
        total: number;
    }>;
    totals: {
        window_total: number;
        by_reader: Record<string, number>;
    };
    latest: {
        timestamp: string;
        by_reader: Record<string, number>;
    };
}

@Injectable({
    providedIn: 'root'
})
export class EmmService {

  constructor(private http: ApiService) { }

    async getEmmChartStats(cardserverid: string = null, emmtype: string = 'shared'): Promise<EmmResponse> {
    return new Promise(async (resolve, reject) => { 
        const to = new Date();
        const from = new Date(to.getTime() - 6 * 60 * 60 * 1000);
        const bucket = 300; // 5 min
        let endPoint = `${ENDPOINTS.stats}/emm?cardserverid=${cardserverid}&emmtype=${emmtype}`; //&from=${from.toISOString()}&to=${to.toISOString()}&bucket=${bucket}
      this.http.requestCall(endPoint,ApiMethod.GET).then((data:any)=>{ //getchannelsinfo
      //console.log(data);
      console.log(`Emm data received`);
      resolve(data) //     
      }).catch((err)=>{
        console.log(`Catched`);
        console.log(err);
        reject(err);
      });
 
    });
  }
}