import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { loadCryptos } from '@pf-app/store';

@Component({
  selector: 'pf-root',
  standalone: true,
  imports: [RouterOutlet],
  providers: [HttpClient],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  title = 'pf-angular-dashboard';

  constructor(private store: Store) {
    this.store.dispatch(loadCryptos());
  }
}
