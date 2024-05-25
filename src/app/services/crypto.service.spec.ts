import { CryptoService } from './crypto.service';
import { of } from 'rxjs';
import { CryptoResponseModel } from '@pf-app/models';

describe('CryptoService', () => {
  it('should fetch cryptocurrency data successfully from API when called', () => {
    // Given
    const http = jasmine.createSpyObj('HttpClient', ['get']);
    const expectedData: CryptoResponseModel[] = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        current_price: 50000,
        market_cap: 1000000,
        total_volume: 50000,
        high_24h: 51000,
        low_24h: 49000,
        price_change_percentage_24h: 2,
        circulating_supply: 18000000
      }
    ];
    http.get.and.returnValue(of(expectedData));
    const service = new CryptoService(http);

    // When
    const result = service.getCryptos();

    // Then
    result.subscribe(data => {
      expect(data).toEqual(expectedData);
      expect(http.get).toHaveBeenCalled();
    });
  });
});
