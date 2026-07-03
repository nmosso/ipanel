import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrandsService {

  constructor(private http: ApiService) { }

  async getBrands(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.requestCall(ENDPOINTS.brands, ApiMethod.GET).then((data: any) => {
        resolve(data.brands);
      }).catch((err: any) => {
        console.error('Error fetching brands', err);
        reject(err.error);
      });
    });
  }

  async addBrand(formData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.requestPost(ENDPOINTS.brands, formData).then((data: any) => {
        resolve(data);
      }).catch((err: any) => {
        console.error('Error adding brand', err);
        reject(err.error);
      });
    });
  }

  async updateBrand(brand: string, formData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const endpoint = `${ENDPOINTS.brands}/${brand}`;
      this.http.requestPut(endpoint, formData).then((data: any) => {
        resolve(data);
      }).catch((err: any) => {
        console.error('Error updating brand', err);
        reject(err.error);
      });
    });
  }

  async deleteBrand(brand: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const endpoint = `${ENDPOINTS.brands}/${brand}`;
      this.http.requestDelete(endpoint, ApiMethod.DELETE, '').then((data: any) => {
        resolve(data);
      }).catch((err: any) => {
        console.error('Error deleting brand', err);
        reject(err.error);
      });
    });
  }
}
