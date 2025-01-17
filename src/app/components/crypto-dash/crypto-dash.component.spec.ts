import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { CryptoDashComponent } from '@pf-app/components';
import {
  selectAllCryptos,
  selectCryptoError,
  selectCryptoLoading,
  selectCryptoParams
} from '@pf-app/store';
import { CryptoCoin, CryptoParams } from '@pf-app/models';
import {
  AsyncPipe,
  CurrencyPipe,
  DecimalPipe,
  NgForOf,
  NgIf,
  PercentPipe,
  TitleCasePipe
} from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('CryptoDashComponent', () => {
  let component: CryptoDashComponent;
  let fixture: ComponentFixture<CryptoDashComponent>;
  let mockParams: CryptoParams;
  let mockCryptos: CryptoCoin[];

  beforeEach(async () => {
    mockParams = {
      per_page: '10',
      page: '1',
      order: 'market_cap_desc',
      sparkline: false,
      vs_currency: 'usd'
    };
    mockCryptos = [
      { id: '1', name: 'Bitcoin', market_cap: 1000000 },
      { id: '2', name: 'Ethereum', market_cap: 500000 }
    ] as CryptoCoin[];

    await TestBed.configureTestingModule({
      imports: [
        CryptoDashComponent,
        AsyncPipe,
        NgIf,
        CurrencyPipe,
        DecimalPipe,
        PercentPipe,
        NgForOf,
        FormsModule,
        TitleCasePipe
      ],
      providers: [
        provideMockStore({
          initialState: {
            crypto: {
              params: mockParams,
              cryptos: mockCryptos,
              loading: false,
              error: null
            }
          },
          selectors: [
            { selector: selectCryptoParams, value: mockParams },
            { selector: selectAllCryptos, value: mockCryptos },
            { selector: selectCryptoLoading, value: false },
            { selector: selectCryptoError, value: null }
          ]
        })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CryptoDashComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update searchQuery on onSearchChange', () => {
    component.onSearchChange('bitcoin');
    expect(component.searchQuery).toBe('bitcoin');
  });

  it('ngOnInit should initialize chart with crypto data', fakeAsync(() => {
    component.ngOnInit();
    tick(); // Simulate the passage of time until all pending asynchronous activities finish

    component.cryptoCall$!.subscribe((cryptos) => {
      expect(cryptos).toEqual(mockCryptos);
    });
  }));
});
