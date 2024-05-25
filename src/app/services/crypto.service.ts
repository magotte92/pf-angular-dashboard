import { Injectable, isDevMode } from '@angular/core';
import { CryptoCoin, CryptoParams, CryptoResponse } from '@pf-app/models';
import { catchError, first, map, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { isJson, toHttpParams } from '@pf-app/utils';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCryptos$(params: CryptoParams): Observable<CryptoResponse> {
    const localCryptos = localStorage.getItem('cryptos');
    const localStoragePage = localStorage.getItem('currentPage');
    if (
      localCryptos !== null &&
      isDevMode() &&
      localStoragePage === params.page
    ) {
      if (!isJson(localCryptos)) {
        console.error('[CryptoService]: JSON has unexpected formatting');
        return of();
      }
      return of({
        data: JSON.parse(localCryptos),
        page: params.page,
      });
    }
    return this.http
      .get<CryptoCoin[]>(this.apiUrl, { params: toHttpParams(params) })
      .pipe(
        first(),
        map((res) => {
          if (isDevMode() || !localCryptos) {
            localStorage.setItem('cryptos', JSON.stringify(res));
            localStorage.setItem('currentPage', params.page);
          }
          return {
            data: res,
            page: params.page,
            paginationOptions: {},
          };
        }),
        catchError((err) => {
          console.error(err);
          return throwError(err);
        }),
      );
  }
}
