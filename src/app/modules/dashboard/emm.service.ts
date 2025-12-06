import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Last5Response, Point } from './types';

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

  async getCardServers() {
    return new Promise(async (resolve, reject) => { 

      let endPoint = `/v3/info/cardservers`; 
      this.http.requestCall(endPoint,ApiMethod.GET).then((data:any)=>{ //getchannelsinfo
      //console.log(data);
      console.log(`Stats data received`);
      resolve(data) //     
      }).catch((err)=>{
        console.log(`Catched`);
        console.log(err);
        reject(err.error);
      });
 
    });
  }
  async getReadersByCardserverid(cardserverid: string = null, cardreaderid: string = null): Promise<any> {
    return new Promise(async (resolve, reject) => {

      let endPoint = `/v3/info/cardreaders`; //&from=${from.toISOString()}&to=${to.toISOString()}&bucket=${bucket}
      //if (cardserverid !== null && cardreaderid === null) endPoint += `?cardserverid=${cardserverid}`;
      //else if (cardreaderid !== null) endPoint += `?cardserverid=${cardserverid}&cardreaderid=${cardreaderid}`;
      this.http.requestCall(endPoint, ApiMethod.GET).then((data: any) => { //getchannelsinfo
        //console.log(data);
        console.log(`Stats data received`);
        resolve(data) //     
      }).catch((err) => {
        console.log(`Catched`);
        console.log(err);
        reject(err.error);
      });

    });
  }

  async restartCardServers(cardserverid:string, cardreader:string = null) {
    return new Promise(async (resolve, reject) => {
      let data = { cardserverid, cardreader, minutes:12 }
      let endPoint = `/v3/query/setemmgstatus`;
      this.http.requestPost(endPoint, data).then((data: any) => { //getchannelsinfo
        //console.log(data);
        console.log(`Stats data received`);
        resolve(data) //     
      }).catch((err) => {
        console.log(`Catched`);
        console.log(err);
        reject(err.error);
      });

    });
  }

  async setemmgstatus(cardserverid: string = null, cardreaderid: string = null, minutes: number = 12): Promise<any> {
    return new Promise(async (resolve, reject) => {
      //debugger
      let endPoint = `/v3/info/setemmgstatus`;
      this.http.requestPost(endPoint, { cardserverid, cardreaderid, minutes}).then((data: any) => { //getchannelsinfo
        console.log(data);
        resolve(data.devices[0]) //     
      }).catch((err: any) => {
        console.log('Error en POST Add Client');
        console.log(err);
        reject(err.error);
      });

    });

  }
    async getClientStats(): Promise<EmmResponse> {
    return new Promise(async (resolve, reject) => { 

      let endPoint = `/v3/tenant/stats`; //&from=${from.toISOString()}&to=${to.toISOString()}&bucket=${bucket}
      this.http.requestCall(endPoint,ApiMethod.GET).then((data:any)=>{ //getchannelsinfo
      //console.log(data);
      console.log(`Stats data received`);
      resolve(data) //     
      }).catch((err)=>{
        console.log(`Catched`);
        console.log(err);
        reject(err.error);
      });
 
    });
  }

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
        reject(err.error);
      });
 
    });
  }

  
  async getEcmChartStats(cardserverid: string = null, emmtype: string = 'shared'): Promise<Last5Response> {
    return new Promise(async (resolve, reject) => {
      const to = new Date();
      const from = new Date(to.getTime() - 6 * 60 * 60 * 1000);
      const bucket = 300; // 5 min
      let endPoint = `${ENDPOINTS.stats}/ecm?cardserverid=${cardserverid}`; //&from=${from.toISOString()}&to=${to.toISOString()}&bucket=${bucket}
      this.http.requestCall(endPoint, ApiMethod.GET).then((rows: any) => { //getchannelsinfo
        let map: Last5Response = {};

        if (Array.isArray(rows)) {
          for (const r of rows) {
            const id = r.cardserverid ?? r.cardserverId ?? r.id;
            if (!id) continue;
            map[id] = (r.last5 ?? []) as Point[];
          }
        } else if (rows && rows.cardserverid && rows.last5) {
          map[rows.cardserverid] = rows.last5 as Point[];
        } else if (rows && typeof rows === 'object') {
          // ya viene mapeado { [cardserverid]: Point[] }
          map = rows as Last5Response;
        } else {
          map = {};
        }
        resolve(map) //     
        
      }).catch((err) => {
        console.log(`Catched`);
        console.log(err);
        reject(err.error);
      });

    });
  }
}