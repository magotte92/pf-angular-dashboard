import { Component, OnInit } from '@angular/core';
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
import { Store } from '@ngrx/store';
import { CryptoCoin, CryptoParams } from '@pf-app/models';
import { Max250, StringNumber } from '@pf-app/types';
import { first, map, mergeMap, Observable } from 'rxjs';
import * as CryptoActions from '../../state/crypto.actions';
import { DISPLAYED_COLUMNS, PER_PAGE } from '@pf-app/components';
import {
  selectAllCryptos,
  selectCryptoError,
  selectCryptoLoading,
  selectCryptoParams,
} from '@pf-app/store';
import { Chart, ChartModule } from 'angular-highcharts';

@Component({
  selector: 'pf-crypto-dash',
  standalone: true,
  imports: [
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
    ChartModule,
  ],
  templateUrl: './crypto-dash.component.html',
  styleUrls: ['./crypto-dash.component.css'],
})
export class CryptoDashComponent implements OnInit {
  cryptocurrencies$?: Observable<CryptoCoin[]>;
  loading$?: Observable<boolean> = this.store.select(selectCryptoLoading);
  error$?: Observable<string | null> = this.store.select(selectCryptoError);
  params!: CryptoParams;
  currentPage: StringNumber = '1';
  perPage: Max250 = '10';
  searchQuery = '';
  chart!: Chart;

  constructor(private store: Store) {
    this.store
      .select(selectCryptoParams)
      .pipe(first())
      .subscribe({
        next: (params) => (this.params = params),
      });
  }

  ngOnInit(): void {
    this.cryptocurrencies$ = this.store.select(selectAllCryptos).pipe(
      mergeMap((cryptos) => {
        return this.chart.ref$.pipe(
          map((chart) => {
            const categories = cryptos.map((coin) => coin.name);
            const data = cryptos.map((coin) => coin.market_cap);
            chart.xAxis[0].setCategories(categories);
            chart.series[0].setData(data);
            return cryptos;
          }),
        );
      }),
    );
    this.perPage = this.params.per_page;
    this.initializeChart();
  }

  relativeChange(page: number): void {
    this.currentPage = (page + +this.currentPage).toString() as StringNumber;
    this.store.dispatch(
      CryptoActions.updateParams({
        params: { ...this.params, page: this.currentPage },
      }),
    );
  }

  onPerPageChange(perPage: Max250): void {
    this.perPage = perPage;
    this.store.dispatch(
      CryptoActions.updateParams({
        params: {
          ...this.params,
          per_page: this.perPage.toString() as Max250,
        },
      }),
    );
  }

  onSearchChange(searchQuery: string): void {
    this.searchQuery = searchQuery;
    // this.store.dispatch(CryptoActions.updateParams({ params: { ...this.params, query: this.searchQuery } }));
  }

  trackByFn(index: number, item: CryptoCoin): string {
    return item.id;
  }

  private initializeChart(): void {
    this.chart = new Chart({
      chart: {
        type: 'column',
      },
      title: {
        text: 'Top Cryptocurrencies by Market Capitalization',
      },
      xAxis: {
        categories: [],
      },
      yAxis: {
        min: 0,
      },
      tooltip: {
        formatter: function () {
          if (!this.y) {
            return;
          }
          return `<strong>${this.key}</strong><br/>Market Cap: $${this.y.toLocaleString()}`;
        },
      },
      series: [
        {
          name: 'Market Cap',
          data: [],
          type: 'column',
        },
      ],
    });
  }

  protected readonly PER_PAGE = PER_PAGE;
  protected readonly DISPLAYED_COLUMNS = DISPLAYED_COLUMNS;
}
