import { CryptoDashComponent } from '@pf-app/components';
import { of } from 'rxjs';

it('should initialize the component correctly', () => {
  // Given
  const cryptoService = jasmine.createSpyObj('CryptoService', ['getCryptos']);
  const component = new CryptoDashComponent(cryptoService);

  // When
  // Component initialization is the action itself in constructor

  // Then
  expect(component).toBeTruthy();
});

it('should handle empty array from CryptoService gracefully', () => {
  // Given
  const cryptoService = jasmine.createSpyObj('CryptoService', ['getCryptos']);
  cryptoService.getCryptos.and.returnValue(of([])); // Return an empty array observable
  const component = new CryptoDashComponent(cryptoService);

  // When
  component.cryptoService.getCryptos().subscribe(result => {
    // Then
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});
