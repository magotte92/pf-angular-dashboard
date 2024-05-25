// src/app/state/crypto.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CryptocurrencyState } from '@pf-app/models';

export const selectCryptoState =
  createFeatureSelector<CryptocurrencyState>('crypto');

export const selectAllCryptos = createSelector(
  selectCryptoState,
  (state: CryptocurrencyState) => state.data,
);

export const selectCryptoLoading = createSelector(
  selectCryptoState,
  (state: CryptocurrencyState) => state.loading,
);

export const selectCryptoError = createSelector(
  selectCryptoState,
  (state: CryptocurrencyState) => state.error,
);

export const selectCryptoParams = createSelector(
  selectCryptoState,
  (state: CryptocurrencyState) => state.params,
);
