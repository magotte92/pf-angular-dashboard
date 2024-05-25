import { StringNumber } from '@pf-app/types';
import { Max250 } from '@pf-app/types';

export interface CryptoParams {
  vs_currency: 'usd' | 'eur';
  order: `market_cap_${'desc' | 'asc'}`;
  per_page: Max250;
  page: StringNumber;
  sparkline: boolean;
}
