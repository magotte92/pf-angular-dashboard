import { Component } from '@angular/core';
import { CryptoService } from '@pf-app/services';
import { AsyncPipe, CurrencyPipe, DecimalPipe, NgForOf, NgIf, PercentPipe } from '@angular/common';

@Component({
  selector: 'pf-crypto-dash',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    CurrencyPipe,
    DecimalPipe,
    PercentPipe,
    NgForOf
  ],
  templateUrl: './crypto-dash.component.html',
  styleUrl: './crypto-dash.component.css'
})
export class CryptoDashComponent {
  constructor(public cryptoService: CryptoService) {
  }
}
