import { cryptoReducer, initialState } from './crypto.reducer';
import * as CryptoActions from './crypto.actions';
import { CryptoCoin, CryptoParams } from '@pf-app/models';

describe('Crypto Reducer', () => {
  it('should return the initial state', () => {
    expect(cryptoReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle loadCryptos action', () => {
    const action = CryptoActions.loadCryptos();
    const expectedState = { ...initialState, loading: true };
    expect(cryptoReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle loadCryptosSuccess action', () => {
    const data = [{ id: '1', name: 'Bitcoin', symbol: 'BTC' } as CryptoCoin];
    const action = CryptoActions.loadCryptosSuccess({ data });
    const expectedState = {
      ...initialState,
      data,
      loading: false,
      error: null,
    };
    expect(cryptoReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle loadCryptosFailure action', () => {
    const error = 'Failed to load data';
    const action = CryptoActions.loadCryptosFailure({ error });
    const expectedState = { ...initialState, loading: false, error };
    expect(cryptoReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle updateParams action', () => {
    const params = {
      vs_currency: 'eur',
      order: 'market_cap_asc',
      per_page: '20',
      page: '2',
      sparkline: true,
    } as CryptoParams;
    const action = CryptoActions.updateParams({ params });
    const expectedState = { ...initialState, params };
    expect(cryptoReducer(initialState, action)).toEqual(expectedState);
  });
});
