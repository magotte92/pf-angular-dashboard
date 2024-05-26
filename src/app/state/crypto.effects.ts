import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import * as CryptoActions from './crypto.actions';
import { selectCryptoParams } from './crypto.selectors';
import { CryptoService } from '@pf-app/services';

@Injectable()
export class CryptoEffects {
  loadCryptos$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CryptoActions.loadCryptos),
      withLatestFrom(this.store.select(selectCryptoParams)),
      switchMap(([, params]) =>
        this.cryptoService.getCryptos$(params).pipe(
          map((data) => CryptoActions.loadCryptosSuccess({ data: data.data })),
          catchError((error) =>
            of(
              CryptoActions.loadCryptosFailure({
                error: 'Failed to load data ' + error,
              }),
            ),
          ),
        ),
      ),
    );
  });

  constructor(
    private actions$: Actions,
    private cryptoService: CryptoService,
    private store: Store,
  ) {}
}
