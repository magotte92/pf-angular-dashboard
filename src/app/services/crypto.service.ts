import { Injectable, isDevMode } from '@angular/core';
import { CryptoResponseModel } from '@pf-app/models';
import { catchError, first, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  getCryptos(): Observable<CryptoResponseModel[]> {
    const params = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: '250',
      page: '1',
      sparkline: 'false'
    };
    const localCryptos = localStorage.getItem('cryptos');
    if (localCryptos !== null && isDevMode()) {
      return of(JSON.parse(localCryptos));
    }
    return this.http.get<CryptoResponseModel[]>(this.apiUrl, { params }).pipe(
      first(),
      map(res => {
        if (isDevMode() || !localCryptos) {
          localStorage.setItem('cryptos', JSON.stringify(res));
        }
        return res;
      }),
      catchError((error) => {
        console.error(error);
        return [];
      }));
  }

}
