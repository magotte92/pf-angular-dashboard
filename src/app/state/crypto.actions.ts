import { createAction, props } from '@ngrx/store';
import { CryptoCoin, CryptoParams } from '@pf-app/models';

export const loadCryptos = createAction('[Crypto] Load Cryptos');
export const loadCryptosSuccess = createAction(
  '[Crypto] Load Cryptos Success',
  props<{ data: CryptoCoin[] }>(),
);
export const loadCryptosFailure = createAction(
  '[Crypto] Load Cryptos Failure',
  props<{ error: string }>(),
);
export const updateParams = createAction(
  '[Crypto] Update Params',
  props<{ params: CryptoParams }>(),
);
