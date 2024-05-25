import { StringNumber } from '@pf-app/types';

export interface CryptoCoin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
}

export interface CryptoResponse {
  data: CryptoCoin[];
  page: StringNumber;
}
