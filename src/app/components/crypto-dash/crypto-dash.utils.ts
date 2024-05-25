import { CryptoCoin } from '@pf-app/models';

export const DISPLAYED_COLUMNS: (keyof CryptoCoin)[] = [
  'id',
  'name',
  'symbol',
  'current_price',
  'market_cap',
  'total_volume',
  'high_24h',
  'low_24h',
  'price_change_percentage_24h',
  'circulating_supply',
];
export const PER_PAGE = [10, 50, 100, 250];
