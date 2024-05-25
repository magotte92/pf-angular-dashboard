// src/app/state/crypto.effects.ts
import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { CryptoService } from '@pf-app/services';
import * as CryptoActions from './crypto.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { selectCryptoParams } from './crypto.selectors';

@Injectable()
export class CryptoEffects {
  loadCryptos$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CryptoActions.loadCryptos),
      concatLatestFrom(() => this.store.select(selectCryptoParams)),
      mergeMap(([, params]) =>
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

  updateParams$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CryptoActions.updateParams),
      map(() => CryptoActions.loadCryptos()),
    );
  });

  constructor(
    private actions$: Actions,
    private cryptoService: CryptoService,
    private store: Store,
  ) {}
}
