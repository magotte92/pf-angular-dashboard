import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CryptoService } from '@pf-app/services';
import { environment } from 'environments/environment';
import { CryptoCoin, CryptoParams, CryptoResponse } from '@pf-app/models';
import { toHttpParams } from '@pf-app/utils';

describe('CryptoService', () => {
  let service: CryptoService;
  let httpMock: HttpTestingController;
  let params: CryptoParams;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CryptoService],
    });
    service = TestBed.inject(CryptoService);
    httpMock = TestBed.inject(HttpTestingController);
    params = {
      page: '1',
      per_page: '10',
      sparkline: false,
      order: 'market_cap_desc',
      vs_currency: 'eur',
    };
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data from API if not in dev mode or no local storage data', () => {
    const dummyResponse: CryptoCoin[] = [
      { id: 'bitcoin', name: 'Bitcoin' } as CryptoCoin,
    ];

    service.getCryptos$(params).subscribe((res: CryptoResponse) => {
      expect(res.data).toEqual(dummyResponse);
      expect(res.page).toEqual('1');
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}?${toHttpParams(params).toString()}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(dummyResponse);
    httpMock.verify(); // Ensure there are no pending requests
  });

  it('should catch HTTP error', () => {
    spyOn(console, 'error');

    service.getCryptos$(params).subscribe(
      () => fail('expected an error, not cryptos'),
      (error) => {
        expect(error).toBeDefined();
        expect(console.error).toHaveBeenCalled();
      },
    );

    const req = httpMock.expectOne(
      `${environment.apiUrl}?${toHttpParams(params).toString()}`,
    );
    expect(req.request.method).toBe('GET');

    req.flush('error', { status: 500, statusText: 'Server Error' });

    // Ensures that there are no pending HTTP requests
    httpMock.verify();
  });
});
