import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withNoIncrementalHydration,
} from '@angular/platform-browser';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { CryptoEffects, cryptoReducer } from '@pf-app/store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHighcharts } from 'highcharts-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHighcharts(),
    provideRouter(
      routes,
      withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' }),
    ),
    provideClientHydration(withNoIncrementalHydration()),
    provideHttpClient(withXhr()),
    provideStore({ crypto: cryptoReducer }),
    provideEffects([CryptoEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideAnimationsAsync(),
  ],
};
