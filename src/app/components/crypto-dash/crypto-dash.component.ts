import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { CryptoCoin } from '@pf-app/models';
import { Observable, tap } from 'rxjs';
import { selectAllCryptos } from '@pf-app/store';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
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
import { MatCheckbox } from '@angular/material/checkbox';

const ANGULAR_CORE = [FormsModule, NgIf, NgForOf];

const ANGULAR_MATERIAL = [
  MatFormFieldModule,
  MatInputModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatCheckbox,
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
  currentSorting?: Sort;
  cryptoCall$: Observable<CryptoCoin[]>;
  updateFlag = false;
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
  chartOptions: Highcharts.Options = {
    title: {
      text: 'Top Cryptocurrencies by Market Capitalization',
    },
    series: [
      {
        name: 'Market Cap',
        type: 'column',
        data: [],
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
    this.cryptoCall$ = this.store.select(selectAllCryptos).pipe(
      tap((cryptos) => {
        this.dataSource.data = cryptos;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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

  updateChart(sortState?: Sort) {
    if (
      !this.dataSource.data ||
      this.paginator?.pageIndex === undefined ||
      this.paginator?.pageSize === undefined
    ) {
      return;
    }
    if (sortState && sortState !== this.currentSorting) {
      this.currentSorting = sortState;
    }
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    let sortedData;
    if (this.currentSorting) {
      const { active, direction } = this.currentSorting;
      sortedData = this.dataSource.filteredData.slice().sort((a, b) => {
        const valueA = a[active as keyof CryptoCoin];
        const valueB = b[active as keyof CryptoCoin];

        let comparison = 0;
        if (valueA > valueB) {
          comparison = 1;
        } else if (valueA < valueB) {
          comparison = -1;
        }

        return direction === 'asc' ? comparison : -comparison;
      });
    }
    const filteredData = (
      sortedData ? sortedData : this.dataSource.filteredData
    ).slice(startIndex, endIndex);
    const categories = filteredData.map((c) => c.id);
    const data = filteredData.map((c) => c.market_cap);
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

  protected readonly PER_PAGE = [5, 10, 25];
}
