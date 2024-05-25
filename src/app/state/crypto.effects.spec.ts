import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { CryptoEffects } from './crypto.effects';
import { CryptoService } from '@pf-app/services';
import * as CryptoActions from './crypto.actions';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectCryptoParams } from './crypto.selectors';
import { CryptoCoin, CryptocurrencyState, CryptoParams } from '@pf-app/models';
import { cold, hot } from 'jasmine-marbles';

describe('CryptoEffects', () => {
  let actions$: Observable<Action>;
  let effects: CryptoEffects;
  let cryptoService: jasmine.SpyObj<CryptoService>;
  let store: MockStore<CryptocurrencyState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CryptoEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {
          provide: CryptoService,
          useValue: jasmine.createSpyObj('CryptoService', ['getCryptos$']),
        },
      ],
    });

    effects = TestBed.inject(CryptoEffects);
    cryptoService = TestBed.inject(
      CryptoService,
    ) as jasmine.SpyObj<CryptoService>;
    store = TestBed.inject(MockStore);
  });

  describe('loadCryptos$', () => {
    it('should return a loadCryptosSuccess action with data on success', () => {
      const params: CryptoParams = {
        page: '2',
        per_page: '50',
        order: 'market_cap_desc',
        vs_currency: 'eur',
        sparkline: false,
      };
      const data = {
        data: [{ id: '1', name: 'Bitcoin', symbol: 'BTC' }] as CryptoCoin[],
      };
      const action = CryptoActions.loadCryptos();
      const outcome = CryptoActions.loadCryptosSuccess({ data: data.data });

      actions$ = hot('-a-', { a: action });
      const response = cold('-a|', { a: data });
      const expected = cold('--b', { b: outcome });

      cryptoService.getCryptos$.and.returnValue(response);
      store.overrideSelector(selectCryptoParams, params);

      expect(effects.loadCryptos$).toBeObservable(expected);
    });

    it('should return a loadCryptosFailure action with error on failure', () => {
      const params: CryptoParams = {
        page: '2',
        per_page: '50',
        order: 'market_cap_desc',
        vs_currency: 'eur',
        sparkline: false,
      };
      const action = CryptoActions.loadCryptos();
      const outcome = CryptoActions.loadCryptosFailure({
        error: 'Failed to load data Error',
      });

      actions$ = hot('-a-', { a: action });
      const response = cold('-#|', {}, 'Error');
      const expected = cold('--b', { b: outcome });

      cryptoService.getCryptos$.and.returnValue(response);
      store.overrideSelector(selectCryptoParams, params);

      expect(effects.loadCryptos$).toBeObservable(expected);
    });
  });

  describe('updateParams$', () => {
    it('should return a loadCryptos action', () => {
      const params: CryptoParams = {
        page: '2',
        per_page: '50',
        order: 'market_cap_desc',
        vs_currency: 'eur',
        sparkline: false,
      };
      const action = CryptoActions.updateParams({ params });
      const outcome = CryptoActions.loadCryptos();

      actions$ = hot('-a-', { a: action });
      const expected = cold('-b', { b: outcome });

      expect(effects.updateParams$).toBeObservable(expected);
    });
  });
});
