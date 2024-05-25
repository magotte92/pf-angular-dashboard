import { toHttpParams } from './to-http-params.utils';
import { CryptoParams } from '@pf-app/models';

describe('toHttpParams', () => {
  it('should convert CryptoParams to HttpParams', () => {
    const params: CryptoParams = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: '10',
      page: '1',
      sparkline: false,
    };
    const httpParams = toHttpParams(params);
    expect(httpParams.get('vs_currency')).toBe('usd');
    expect(httpParams.get('order')).toBe('market_cap_desc');
    expect(httpParams.get('per_page')).toBe('10');
    expect(httpParams.get('page')).toBe('1');
    expect(httpParams.get('sparkline')).toBe('false');
  });

  it('should handle empty params object', () => {
    const params: CryptoParams = {} as CryptoParams;
    const httpParams = toHttpParams(params);
    expect(httpParams.keys().length).toBe(0);
  });

  it('should handle params with numeric values', () => {
    const params = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 10,
      page: 1,
      sparkline: false,
    } as unknown as CryptoParams;
    const httpParams = toHttpParams(params);
    expect(httpParams.get('per_page')).toBe('10');
    expect(httpParams.get('page')).toBe('1');
  });

  it('should handle params with boolean values', () => {
    const params: CryptoParams = {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: '10',
      page: '1',
      sparkline: true,
    };
    const httpParams = toHttpParams(params);
    expect(httpParams.get('sparkline')).toBe('true');
  });
});
