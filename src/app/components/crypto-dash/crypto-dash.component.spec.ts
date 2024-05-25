import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { CryptoDashComponent } from '@pf-app/components';
import {
  selectAllCryptos,
  selectCryptoError,
  selectCryptoLoading,
  selectCryptoParams,
} from '@pf-app/store';
import { CryptoCoin, CryptoParams } from '@pf-app/models';
import * as CryptoActions from '../../state/crypto.actions';
import { Chart, ChartModule } from 'angular-highcharts';
import { Observable, of } from 'rxjs';
import {
  AsyncPipe,
  CurrencyPipe,
  DecimalPipe,
  NgForOf,
  NgIf,
  PercentPipe,
  TitleCasePipe,
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColumnNamePipe, ColumnRowPipe } from '@pf-app/pipes';

describe('CryptoDashComponent', () => {
  let component: CryptoDashComponent;
  let fixture: ComponentFixture<CryptoDashComponent>;
  let store: MockStore;
  let mockParams: CryptoParams;
  let mockCryptos: CryptoCoin[];
  let mockChart: any;

  beforeEach(async () => {
    mockParams = {
      per_page: '10',
      page: '1',
      order: 'market_cap_desc',
      sparkline: false,
      vs_currency: 'usd',
    };
    mockCryptos = [
      { id: '1', name: 'Bitcoin', market_cap: 1000000 },
      { id: '2', name: 'Ethereum', market_cap: 500000 },
    ] as CryptoCoin[];
    mockChart = {
      ref$: Observable<Chart>,
    };
    await TestBed.configureTestingModule({
      imports: [
        CryptoDashComponent,
        ChartModule,
        AsyncPipe,
        NgIf,
        CurrencyPipe,
        DecimalPipe,
        PercentPipe,
        NgForOf,
        FormsModule,
        ColumnNamePipe,
        TitleCasePipe,
        ColumnRowPipe,
      ],
      providers: [
        provideMockStore({
          initialState: {
            crypto: {
              params: mockParams,
              cryptos: mockCryptos,
              loading: false,
              error: null,
            },
          },
          selectors: [
            { selector: selectCryptoParams, value: mockParams },
            { selector: selectAllCryptos, value: mockCryptos },
            { selector: selectCryptoLoading, value: false },
            { selector: selectCryptoError, value: null },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(CryptoDashComponent);
    component = fixture.componentInstance;
    component.chart = mockChart;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set cryptocurrencies$ and call initializeChart', () => {
    const initChart = spyOn<any>(
      component,
      'initializeChart',
    ).and.callThrough();
    store.dispatch(CryptoActions.loadCryptos());
    component.ngOnInit();

    component.cryptocurrencies$!.subscribe((cryptos) => {
      expect(cryptos).toEqual(mockCryptos);
    });
    expect(component.perPage).toBe('10');
    expect(initChart).toHaveBeenCalled();
  });

  it('should dispatch updateParams action on relativeChange', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    component.relativeChange(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      CryptoActions.updateParams({ params: { ...mockParams, page: '2' } }),
    );
  });

  it('should dispatch updateParams action on onPerPageChange', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    component.onPerPageChange('20' as const);
    expect(dispatchSpy).toHaveBeenCalledWith(
      CryptoActions.updateParams({ params: { ...mockParams, per_page: '20' } }),
    );
  });

  it('should update searchQuery on onSearchChange', () => {
    component.onSearchChange('bitcoin');
    expect(component.searchQuery).toBe('bitcoin');
  });

  it('should track by item id in trackByFn', () => {
    const trackById = component.trackByFn(0, {
      id: '1',
      name: 'Bitcoin',
      market_cap: 1000000,
    } as CryptoCoin);
    expect(trackById).toBe('1');
  });

  it('should initialize chart in initializeChart', () => {
    component['initializeChart']();
    expect(component.chart).toBeDefined();
  });

  it('ngOnInit should initialize chart with crypto data', fakeAsync(() => {
    component.ngOnInit();
    tick(); // Simulate the passage of time until all pending asynchronous activities finish

    component.cryptocurrencies$!.subscribe((cryptos) => {
      expect(cryptos).toEqual(mockCryptos);
      expect(mockChart.ref$.value.xAxis[0].setCategories).toHaveBeenCalledWith([
        'Bitcoin',
        'Ethereum',
      ]);
      expect(mockChart.ref$.value.series[0].setData).toHaveBeenCalledWith([
        1000000, 500000,
      ]);
    });
  }));

  it('should call setCategories and setData on chart when cryptos change', fakeAsync(() => {
    component.ngOnInit();
    tick(); // Simulate the passage of time until all pending asynchronous activities finish

    component.cryptocurrencies$!.subscribe((cryptos) => {
      const categories = cryptos.map((coin) => coin.name);
      const data = cryptos.map((coin) => coin.market_cap);

      expect(mockChart.ref$.value.xAxis[0].setCategories).toHaveBeenCalledWith(
        categories,
      );
      expect(mockChart.ref$.value.series[0].setData).toHaveBeenCalledWith(data);
    });
  }));

  it('should mock cryptocurrencies$ to return new value and inspect ref$ of chart', fakeAsync(() => {
    const newCryptos: CryptoCoin[] = [
      { id: '3', name: 'Litecoin', market_cap: 300000 },
      { id: '4', name: 'Ripple', market_cap: 400000 },
    ] as CryptoCoin[];

    component.cryptocurrencies$ = of(newCryptos);
    component.ngOnInit();
    tick(); // Simulate the passage of time until all pending asynchronous activities finish

    component.cryptocurrencies$!.subscribe(() => {
      const categories = newCryptos.map((coin) => coin.name);
      const data = newCryptos.map((coin) => coin.market_cap);

      expect(mockChart.ref$.value.xAxis[0].setCategories).toHaveBeenCalledWith(
        categories,
      );
      expect(mockChart.ref$.value.series[0].setData).toHaveBeenCalledWith(data);
    });
  }));
});
