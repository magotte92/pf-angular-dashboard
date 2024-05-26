import { Injectable } from '@angular/core';
import { CryptoCoin, CryptoParams, CryptoResponse } from '@pf-app/models';
import { catchError, first, map, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { toHttpParams } from '@pf-app/utils';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCryptos$(params: CryptoParams): Observable<CryptoResponse> {
    return this.http
      .get<CryptoCoin[]>(this.apiUrl, { params: toHttpParams(params) })
      .pipe(
        first(),
        map((res) => {
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
