import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { CryptoCoin, CryptoParams } from '@pf-app/models';
import { Max250, StringNumber } from '@pf-app/types';
import { first, map, mergeMap, Observable, of, switchMap } from 'rxjs';
import { selectAllCryptos, selectCryptoError, selectCryptoLoading, selectCryptoParams } from '@pf-app/store';
import { Chart, ChartModule } from 'angular-highcharts';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AsyncPipe, CurrencyPipe, DecimalPipe, NgForOf, NgIf, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

const ANGULAR_CORE = [FormsModule,
  NgIf,
  NgForOf];

const ANGULAR_MATERIAL = [MatFormFieldModule,
  MatInputModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatSelectModule,
  MatProgressSpinnerModule];

const PIPES = [DecimalPipe,
  PercentPipe,
  CurrencyPipe,
  AsyncPipe];

@Component({
  selector: 'pf-crypto-dash',
  standalone: true,
  imports: [
    ...ANGULAR_CORE,
    ...PIPES,
    ...ANGULAR_MATERIAL,
    ChartModule
  ],
  templateUrl: './crypto-dash.component.html',
  styleUrls: ['./crypto-dash.component.css']
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
    'circulating_supply'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private store: Store) {
    this.store.select(selectCryptoParams).pipe(first()).subscribe({
      next: (params) => (this.params = params)
    });
  }

  ngOnInit(): void {
    this.cryptocurrencies$ = this.store.select(selectAllCryptos).pipe(
      mergeMap((cryptos) => {
        const categories = cryptos.map((coin) => coin.name);
        const data = cryptos.map((coin) => coin.market_cap);
        this.chart.ref$.subscribe((chart) => {
          chart.xAxis[0].setCategories(categories);
          chart.series[0].setData(data);
        });
        this.dataSource.data = cryptos;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        return of(cryptos);
      })
    );
    this.dataSource.filterPredicate = (data: CryptoCoin, filter: string) =>
      data.name.toLowerCase().includes(filter) || data.symbol.toLowerCase().includes(filter);
    this.initializeChart();
  }

  onSearchChange(searchQuery: string): void {
    this.searchQuery = searchQuery;
    this.dataSource.filter = searchQuery.trim().toLowerCase();
  }

  private initializeChart(): void {
    this.chart = new Chart({
      chart: {
        type: 'column'
      },
      title: {
        text: 'Top Cryptocurrencies by Market Capitalization'
      },
      xAxis: {
        categories: []
      },
      yAxis: {
        min: 0
      },
      tooltip: {
        formatter: function() {
          if (!this.y) {
            return;
          }
          return `<strong>${this.key}</strong><br/>Market Cap: $${this.y.toLocaleString()}`;
        }
      },
      series: [
        {
          name: 'Market Cap',
          data: [],
          type: 'column'
        }
      ]
    });
  }

  protected readonly PER_PAGE = [5, 10, 25, 100];
}
