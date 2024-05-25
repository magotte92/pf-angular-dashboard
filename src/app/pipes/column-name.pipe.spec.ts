// column-name.pipe.spec.ts
import { ColumnNamePipe } from './column-name.pipe';
import { CryptoCoin } from '@pf-app/models';

describe('ColumnNamePipe', () => {
  let pipe: ColumnNamePipe;

  beforeEach(() => {
    pipe = new ColumnNamePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform value based on the column key', () => {
    const crypto: CryptoCoin = {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
    } as CryptoCoin;
    expect(pipe.transform(crypto, 'name')).toBe('Bitcoin');
    expect(pipe.transform(crypto, 'symbol')).toBe('BTC');
  });

  it('should return empty string if column does not exist in value', () => {
    const crypto: CryptoCoin = {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
    } as CryptoCoin;
    expect(
      pipe.transform(crypto, 'nonExistentColumn' as keyof CryptoCoin),
    ).toBe('');
  });
});
