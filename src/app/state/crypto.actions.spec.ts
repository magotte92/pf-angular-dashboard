import * as fromActions from './crypto.actions';
import { CryptoCoin, CryptoParams } from '@pf-app/models';

describe('Crypto Actions', () => {
  it('should create loadCryptos action', () => {
    const action = fromActions.loadCryptos();
    expect(action.type).toBe('[Crypto] Load Cryptos');
  });

  it('should create loadCryptosSuccess action', () => {
    const data: CryptoCoin[] = [
      { id: '1', name: 'Bitcoin', symbol: 'BTC' },
      { id: '2', name: 'Ethereum', symbol: 'ETH' },
    ] as CryptoCoin[];
    const action = fromActions.loadCryptosSuccess({ data });
    expect(action.type).toBe('[Crypto] Load Cryptos Success');
    expect(action.data).toEqual(data);
  });

  it('should create loadCryptosFailure action', () => {
    const error = 'Failed to load cryptos';
    const action = fromActions.loadCryptosFailure({ error });
    expect(action.type).toBe('[Crypto] Load Cryptos Failure');
    expect(action.error).toBe(error);
  });

  it('should create updateParams action', () => {
    const params: CryptoParams = {
      page: '2',
      per_page: '50',
      order: 'market_cap_desc',
      vs_currency: 'eur',
      sparkline: false,
    };
    const action = fromActions.updateParams({ params });
    expect(action.type).toBe('[Crypto] Update Params');
    expect(action.params).toEqual(params);
  });
});
