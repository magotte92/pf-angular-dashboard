import { createReducer, on } from '@ngrx/store';
import * as CryptoActions from './crypto.actions';
import { CryptocurrencyState } from '@pf-app/models';
import { PER_PAGE } from '@pf-app/components';
import { Max250 } from '@pf-app/types';

export const initialState: CryptocurrencyState = {
  data: [],
  error: null,
  loading: false,
  params: {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page:
      PER_PAGE?.length && PER_PAGE.length > 0
        ? (PER_PAGE[0].toString() as Max250)
        : '10',
    page: '1',
    sparkline: false,
  },
};

export const cryptoReducer = createReducer(
  initialState,
  on(
    CryptoActions.loadCryptos,
    (state): CryptocurrencyState => ({
      ...state,
      loading: true,
    }),
  ),
  on(
    CryptoActions.loadCryptosSuccess,
    (state, { data }): CryptocurrencyState => ({
      ...state,
      data,
      loading: false,
      error: null,
    }),
  ),
  on(
    CryptoActions.loadCryptosFailure,
    (state, { error }): CryptocurrencyState => ({
      ...state,
      loading: false,
      error,
    }),
  ),
  on(
    CryptoActions.updateParams,
    (state, { params }): CryptocurrencyState => ({
      ...state,
      params,
    }),
  ),
);
