import { createReducer, on } from '@ngrx/store';
import * as CryptoActions from './crypto.actions';
import { CryptocurrencyState } from '@pf-app/models';

export const initialState: CryptocurrencyState = {
  data: [],
  error: null,
  loading: false,
  params: {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: '250',
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
