import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UrlField} from '../bo/UrlField';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Services {

  // local
  // URL = 'http://192.168.0.155:8081';

  // demo heroku
  URL = 'https://controlventas-backend-demo.herokuapp.com';

  constructor(private http: HttpClient) {

  }

  getAllItemsFromEntity(entity: string) {

    const headers = new HttpHeaders({
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    });

    return this.http.get(this.URL + '/' + entity + '/' + 'getAll',{headers});
  }


  getItemsFromEntityByFields(entity: string, method: string, fields: UrlField[]) {

    const headers = new HttpHeaders({
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    });

    let urlFields = '';
    let cont = 0;
    for (const field of fields) {
      if (cont > 0) {
        urlFields += '&' + field.fieldName + '=' + field.value;
      } else if (cont === 0) {
        urlFields = field.fieldName + '=' + field.value;
      }

      cont++;
    }
    return this.http.get(this.URL + '/' + entity + '/' + method + '?' + urlFields,
      {headers});
  }

  getItemsFromEntityByFieldsPromise(entity: string, method: string, fields: UrlField[]) {

    const headers = new HttpHeaders({
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    });

    let urlFields = '';
    let cont = 0;
    for (const field of fields) {
      if (cont > 0) {
        urlFields += '&' + field.fieldName + '=' + field.value;
      } else if (cont === 0) {
        urlFields = field.fieldName + '=' + field.value;
      }

      cont++;
    }
    return this.http.get(this.URL + '/' + entity + '/' + method + '?' + urlFields,
      {headers}).toPromise();
  }

  saveEntity(entity: string, body: any): Observable<any> {
    const headers = new HttpHeaders({
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    });

    return this.http.post(this.URL + '/' + entity, body, {headers});
  }

  saveEntityPromise(entity: string, body: any): Promise<any> {
    const headers = new HttpHeaders({
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    });

    return this.http.post(this.URL + '/' + entity, body, {headers}).toPromise();
  }

  editEntity(entity: string, body: any): Observable<any> {
    const headers = new HttpHeaders({
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    });

    return this.http.put(this.URL + '/' + entity, body, {headers});
  }

  deleteEntity(entity: string, id: number): Observable<any>{
    const headers = new HttpHeaders({
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    });

    return this.http.delete(this.URL + '/' + entity + '?id=' + id,  {headers});
  }

  getFromEntityByPage(entity: string, obj: any): Observable<any> {

    const headers = new HttpHeaders({
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    });

    return this.http.post(this.URL + '/' + entity + '/' + 'getByPage', obj, {headers});
  }

  getFromEntityAndMethod(entity: string, method: string, obj: any): Observable<any> {

    const headers = new HttpHeaders({
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    });

    return this.http.post(this.URL + '/' + entity + '/' + method, obj, {headers});
  }

  getFromEntityAndMethodString(entity: string, method: string, obj: any): Observable<any> {

    const headers = new HttpHeaders({
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    });

    return this.http.post(this.URL + '/' + entity + '/' + method, obj, {headers: headers, responseType: 'text'});
  }

  getFromEntityAndMethodPromise(entity: string, method: string, obj: any): Promise<any> {

    const headers = new HttpHeaders({
      'Access-Control-Allow-Headers' : 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    });

    return this.http.post(this.URL + '/' + entity + '/' + method, obj, {headers}).toPromise();
  }

}
