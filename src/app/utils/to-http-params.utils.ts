import { HttpParams } from '@angular/common/http';
import { CryptoParams } from '@pf-app/models';

export function toHttpParams(params: CryptoParams): HttpParams {
  let httpParams = new HttpParams();

  (Object.keys(params) as (keyof CryptoParams)[]).forEach((key) => {
    const value = params[key];
    if (value !== undefined && value !== null) {
      httpParams = httpParams.append(key, value.toString());
    }
  });
  return httpParams;
}
