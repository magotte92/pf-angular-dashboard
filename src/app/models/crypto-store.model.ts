import { CryptoCoin } from './crypto-response.model';
import { CryptoParams } from './crypto-params.model';

export interface CryptocurrencyState {
  params: CryptoParams;
  data: CryptoCoin[];
  error: string | null;
  loading: boolean;
}
