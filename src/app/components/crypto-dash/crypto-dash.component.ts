import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { CryptoCoin, CryptoParams } from '@pf-app/models';
import { Max250, StringNumber } from '@pf-app/types';
import { first, Observable, tap } from 'rxjs';
import {
  selectAllCryptos,
  selectCryptoError,
  selectCryptoLoading,
  selectCryptoParams,
} from '@pf-app/store';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  AsyncPipe,
  CurrencyPipe,
  DecimalPipe,
  NgForOf,
  NgIf,
  PercentPipe,
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

const ANGULAR_CORE = [FormsModule, NgIf, NgForOf];

const ANGULAR_MATERIAL = [
  MatFormFieldModule,
  MatInputModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatSelectModule,
  MatProgressSpinnerModule,
];

const PIPES = [DecimalPipe, PercentPipe, CurrencyPipe, AsyncPipe];

@Component({
  selector: 'pf-crypto-dash',
  standalone: true,
  imports: [
    ...ANGULAR_CORE,
    ...PIPES,
    ...ANGULAR_MATERIAL,
    HighchartsChartModule,
  ],
  templateUrl: './crypto-dash.component.html',
  styleUrls: ['./crypto-dash.component.css'],
})
export class CryptoDashComponent implements OnInit {
  cryptoCall$: Observable<CryptoCoin[]>;
  updateFlag = false;
  loading$?: Observable<boolean> = this.store.select(selectCryptoLoading);
  error$?: Observable<string | null> = this.store.select(selectCryptoError);
  params!: CryptoParams;
  currentPage: StringNumber = '1';
  perPage: Max250 = '10';
  searchQuery = '';
  Highcharts: typeof Highcharts = Highcharts;
  dataSource = new MatTableDataSource<CryptoCoin>();
  displayedColumns: string[] = [
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
  chartData = [];

  chartOptions: Highcharts.Options = {
    title: {
      text: 'Top Cryptocurrencies by Market Capitalization',
    },
    series: [
      {
        name: 'Market Cap',
        type: 'column',
        data: this.chartData,
      },
    ],
    xAxis: {
      categories: [],
    },
    yAxis: {
      min: 0,
    },
    tooltip: {
      formatter: function () {
        if (!this.y) return;
        return `<strong>${this.key}</strong><br/>Market Cap: $${this.y.toLocaleString()}`;
      },
    },
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private store: Store) {
    this.store
      .select(selectCryptoParams)
      .pipe(first())
      .subscribe({
        next: (params) => (this.params = params),
      });
    this.cryptoCall$ = this.store.select(selectAllCryptos).pipe(
      tap((cryptos) => {
        this.dataSource.data = cryptos;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        const categories = cryptos.map((coin) => coin.name);
        const data = cryptos.map((coin) => coin.market_cap);
        this.updateChart(categories, data);
      }),
    );
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: CryptoCoin, filter: string) =>
      data.name.toLowerCase().includes(filter) ||
      data.symbol.toLowerCase().includes(filter);
  }

  onSearchChange(searchQuery: string): void {
    this.searchQuery = searchQuery;
    this.dataSource.filter = searchQuery.trim().toLowerCase();
  }

  private updateChart(categories: string[], data: number[]) {
    this.chartOptions = {
      ...this.chartOptions,
      xAxis: {
        ...this.chartOptions.xAxis,
        categories,
      },
    };

    this.chartOptions.series![0] = {
      type: 'column',
      data,
    };

    this.updateFlag = true;
  }

  protected readonly PER_PAGE = [5, 10, 25, 100];
}
