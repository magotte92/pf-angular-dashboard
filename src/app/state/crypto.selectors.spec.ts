import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { CryptoCoin, CryptocurrencyState } from '@pf-app/models';
import {
  selectAllCryptos,
  selectCryptoError,
  selectCryptoLoading,
  selectCryptoParams,
  selectCryptoState,
} from './crypto.selectors';

describe('Crypto Selectors', () => {
  let store: MockStore<CryptocurrencyState>;

  const initialState: CryptocurrencyState = {
    data: [{ id: '1', name: 'Bitcoin', symbol: 'BTC' } as CryptoCoin],
    loading: false,
    error: null,
    params: {
      per_page: '10',
      page: '1',
      order: 'market_cap_desc',
      sparkline: false,
      vs_currency: 'usd',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState,
          selectors: [
            { selector: selectCryptoState, value: initialState },
            { selector: selectAllCryptos, value: initialState.data },
            { selector: selectCryptoLoading, value: initialState.loading },
            { selector: selectCryptoError, value: initialState.error },
            { selector: selectCryptoParams, value: initialState.params },
          ],
        }),
      ],
    });

    store = TestBed.inject(MockStore);
  });

  it('should select all cryptos', (done) => {
    store.select(selectAllCryptos).subscribe((data) => {
      expect(data).toEqual(initialState.data);
      done();
    });
  });

  it('should select crypto loading state', (done) => {
    store.select(selectCryptoLoading).subscribe((loading) => {
      expect(loading).toBe(initialState.loading);
      done();
    });
  });

  it('should select crypto error state', (done) => {
    store.select(selectCryptoError).subscribe((error) => {
      expect(error).toBe(initialState.error);
      done();
    });
  });

  it('should select crypto params', (done) => {
    store.select(selectCryptoParams).subscribe((params) => {
      expect(params).toEqual(initialState.params);
      done();
    });
  });
});
