# Crypto Dashboard modernization plan

This plan starts from `develop` after the Angular 22.2 upgrade (`0f6daec`, PR #2). It does not add features beyond the dashboard that already exists: one CoinGecko markets list, a market-cap column chart of the visible page, and client-side search, sort, and pagination.

North star for the work that follows: **Angular 22+, standalone, zoneless, Tailwind CSS v4, signals and services.** Leave out PrimeNG, Angular Material, NgRx, and Zone.js.

Researched 30 September 2026. Prefer the stable releases named below. Skip nightlies, and skip Angular 22.2 developer-preview APIs (`@boundary`, router resources).

---

## 1. Idea

A single-page cryptocurrency dashboard. On load it requests [CoinGecko `/coins/markets`](https://docs.coingecko.com/docs/keyless-public-api) and shows:

- a column chart of market cap for the rows on the current page
- a table of name, symbol, price, market cap, volume, 24h high, 24h low, 24h change, and circulating supply
- search by name or symbol, column sort, and page sizes 5 / 10 / 25

The route is `/crypto-dashboard`. Any other path redirects there. There is no account, portfolio, or second screen.

The `pf-` prefix, package name `pf-angular-dashboard`, and commit series `PF-0`…`PF-3` read as a short portfolio exercise. The README still says the tests and lint setup were written to demonstrate coverage, not as a product standard. Treat the screen above as the product. Treat NgRx, Material, and the coverage-oriented specs as the implementation to replace.

Two history notes that change the plan:

- Tailwind CSS 3.4 was in the original app and was removed in `b978c34` ("Replace with angular material to save time"). Returning to Tailwind is restoring that UI choice on current v4, using the utility classes in templates. Do not restore `tailwind.config.js`.
- SSR was scaffolded (`@angular/ssr`, `express`, `provideClientHydration`) and the `serve:ssr` script is already gone. There is no `server.ts`. The running app is client-side rendering.

Uncertainty: nothing in the repo says this must track more than the top markets page, refresh on a timer, or support a quote currency other than the `usd | eur` union already on `CryptoParams`. Those stay out of scope except the currency control, which the model already allows and the UI never wired up.

---

## 2. Current stack

| Area | What `develop` actually uses |
| --- | --- |
| Runtime | Node `24.21.0` (`.nvmrc`). `package.json` `engines` allows `^22.22.3`, `^24.15.0`, or `>=26`. |
| App | Angular **22.2**, standalone components, `bootstrapApplication`. TypeScript **~6.0.3**. `moduleResolution: "bundler"`. |
| Change detection | `zone.js` ~0.16 is still a polyfill. Both components set `ChangeDetectionStrategy.Eager`, which the v22 migration adds so upgraded apps keep the old Default behavior. |
| UI | Angular Material and CDK **22.2**, prebuilt indigo-pink theme. Roboto and Material Icons from the Google Fonts CDN. |
| State | NgRx Store, Effects, and Store Devtools **22.0**. `@ngrx/entity` and `@ngrx/component-store` are installed and never imported. |
| HTTP | `provideHttpClient(withXhr())`. `CryptoService.getCryptos$` GETs `environment.apiUrl` (`https://api.coingecko.com/api/v3/coins/markets`). Dev and prod URLs are the same public endpoint. No API key. |
| Chart | Highcharts **^13.1.1** via `highcharts-angular` **^5.4.1** and `provideHighcharts()`. |
| RxJS | `~7.8.2`, which is inside Angular 22's supported range (`^6.5.3` or `^7.4.0`). |
| Tests | Karma + Jasmine (`@angular/build:karma`), ChromeHeadless, `jasmine-marbles` for the effect. `npm test` is `--watch=false` with coverage. |
| Lint | ESLint 10 flat config (`eslint.config.js`), `angular-eslint` 22.5, `@ngrx/eslint-plugin`. `**/*.spec.ts` is ignored. |
| Format | Prettier 3. |
| CI | `.github/workflows/ci.yml` on pull requests and `develop`: Node 24, `npm ci`, `lint`, `test`, `build`. |
| Styles | Component CSS plus a small global reset. `postcss` is a devDependency. No Tailwind config, no PostCSS config. |

How it runs today:

```bash
npm ci
npm run start:dev   # ng serve, development configuration
npm test            # Karma, ChromeHeadless, coverage
npm run lint
npm run build       # production configuration
```

Data flow: `AppComponent` dispatches `loadCryptos` from its constructor. `CryptoEffects` reads `params` from the store and calls `CryptoService`. The reducer stores the array. `CryptoDashComponent` selects that array, copies it into `MatTableDataSource`, and rebuilds the Highcharts options for the current page.

Defaults that never change from the UI: `vs_currency=usd`, `order=market_cap_desc`, `per_page=250`, `page=1`, `sparkline=false`. `updateParams` is implemented and tested, and nothing dispatches it. The effect listens only to `loadCryptos`.

### Behavior the next pass has to keep, and bugs it has to fix

Keep:

- One markets request on load. Search, sort, and pagination run on that array. They must not refetch.
- Page sizes 5, 10, 25. Chart categories and market-cap values are the rows on the current page, after filter and sort.
- Columns and route redirects listed above.
- Path prefix `pf` for component selectors (`angular.json` prefix is already `pf`).

Fix, with tests, before or during the rewrite:

- `price_change_percentage_24h` is piped through `percent`. CoinGecko already returns a percentage (about `1.5` for +1.5%). `PercentPipe` multiplies by 100, so the cell shows ~150%.
- `@if (cryptoCall$ | async)` treats `[]` as success. `selectAllCryptos` emits `[]` immediately, so the spinner branch does not run. `selectCryptoLoading` and `selectCryptoError` are never used. A failed request leaves an empty table.
- The chart does not subscribe to the paginator `page` event, and `onSearchChange` only sets the table filter. The chart can show a different window than the table.
- `MatSelectModule` is imported and unused. `AppComponent` lists `HttpClient` in `providers` even though `provideHttpClient` is registered. `provideAnimations()` and `provideAnimationsAsync()` are both registered.
- `isJson` is only referenced by its own spec. `@pf-app/pipes` points at a folder removed with the old column pipe.
- The sort comparator uses `>` and does not treat an empty Material sort direction as "back to API order".
- Several numeric fields can be `null` in real CoinGecko payloads. The model types them as `number`.

The component spec checks that the class is created and that `onSearchChange` stores a string. It does not render the table. Its mock state uses a `cryptos` field; the reducer field is `data`. Selector overrides hide that. Those specs are not the contract. The pure functions in Phase 1 are.

---

## 3. Modern fit

Candidates below were checked against the current dashboard. Versions are stable lines as of 30 September 2026.

### Platform (already on the right major)

| Choice | Why it fits |
| --- | --- |
| **Angular 22.2.x** (stay here) | Current release on this repo. [v22](https://blog.angular.dev/announcing-angular-v22-c52bb83a4664) (3 June 2026) made `resource`, `rxResource`, `httpResource`, and Signal Forms stable, and Fetch the default HTTP backend. [v22.2](https://blog.ninja-squad.com/2026/09/23/what-is-new-angular-22.2) (23 September 2026) is the latest minor. Node and TypeScript ranges match [angular.dev/reference/versions](https://angular.dev/reference/versions): TypeScript `>=6.0 <6.1`, Node `^22.22.3`, `^24.15.0`, or `>=26`. |
| **Zoneless change detection** | Stable since 20.2, default for *new* apps since 21. This app was upgraded, so `zone.js` is still installed. Removing it is the remaining step. Guide: [angular.dev/guide/zoneless](https://angular.dev/guide/zoneless). |
| **`httpResource()`** | Stable in 22. Replaces the load / success / failure action cycle for a single GET whose inputs are signals. |
| **Built-in control flow** (`@if`, `@for`) | Already started (`@if` around the dashboard). Finish it when the Material template is deleted. |
| **Vitest via `@angular/build:unit-test`** | Default test runner for current CLI apps. Vitest support is stable; the CLI in 22.2 uses Vitest 5. Karma still runs here and upstream Karma is deprecated. Migration: [angular.dev/guide/testing/migrating-to-vitest](https://angular.dev/guide/testing/migrating-to-vitest). |

Do not adopt, even though they shipped nearby:

- **Signal Forms.** Stable in 22, and this screen has a search box and a page-size select. Signals are enough.
- **`@boundary` and router resources.** Developer preview in 22.2.
- **`@Service`.** Not the documented replacement for `@Injectable`. Keep `@Injectable({ providedIn: 'root' })`.

### Styling

| Choice | Why it fits |
| --- | --- |
| **Tailwind CSS 4** via the Angular guide | Official setup is `ng add tailwindcss` or `tailwindcss` + `@tailwindcss/postcss` and `@import "tailwindcss"` in `src/styles.css`. See [angular.dev/guide/tailwind](https://angular.dev/guide/tailwind) and [Tailwind's Angular guide](https://tailwindcss.com/docs/installation/framework-guides/angular). v4 scans templates itself. Theme tokens live in CSS (`@theme`). `postcss` is already a devDependency. Autoprefixer is built into the v4 PostCSS plugin; do not reinstall it. |
| Tailwind 3 `tailwind.config.js` | What this repo deleted. The v3 config file and `@tailwind base/components/utilities` directives break a v4 build. |

Angular Material 22 and PrimeNG are maintained and would save table markup. They are out of the north star. A native `<table>` of at most 25 visible rows does not need a grid library (no AG Grid, no TanStack Table wrapper).

### Charts

| Choice | Why it fits |
| --- | --- |
| **Chart.js 4**, registered by hand | MIT. A bar chart of one series is the whole requirement. Import `BarController`, `BarElement`, `CategoryScale`, `LinearScale`, and `Tooltip` only, so the production budget is not paying for `chart.js/auto`. Update the canvas from an `effect()` when the visible-row signal changes. That works zoneless, because the chart is imperative and does not need Zone to notice the signal. |
| **Apache ECharts** | Apache-2.0, actively maintained, better if a later chart needs zoom or brush. Heavy for one column chart. `ngx-echarts` is optional and another version to track. |
| **Highcharts 13 + `highcharts-angular` 5** | Already integrated and technically fine. The [20 January 2026 EULA](https://shop.highcharts.com/license-eula-1.0.pdf) covers personal and educational use. A public site or anything commercial needs a paid license. Drop it so the repo does not depend on that reading. |
| **ng2-charts** | Wrapper around Chart.js. The 10.0.0 release (March 2026) targets Angular 21 and depends on `@angular/cdk`. One canvas does not need that wrapper or CDK. |

### Data and state

| Choice | Why it fits |
| --- | --- |
| **`httpResource` in one root service** | The screen is one request plus local view state. A signal `query` is the request input. `status`, `value`, and `error` replace the four selectors. |
| **Pure functions for filter, sort, page slice, chart series, and percent text** | They are the test contract and they do not care about NgRx or Material. |
| **RxJS 7.8** | Stays as an Angular dependency. Application code should stop using it for this flow. Do not upgrade to RxJS 8 unless a future Angular peer range requires it. |
| **NgRx 22, including SignalStore (`@ngrx/signals`)** | Maintained, and a reasonable choice in a larger app. This app has one list. The north star excludes NgRx. SignalStore is the alternative to document and not take. |

### API

| Choice | Why it fits |
| --- | --- |
| **CoinGecko keyless `/coins/markets`** | [Still the documented no-signup endpoint](https://docs.coingecko.com/docs/keyless-public-api) for this payload, including the exact URL already in `environment.ts`. Shared IP rate limits. CoinGecko's own 2026 note: suitable for prototypes and light use, not polling. |
| **Optional Demo key header `x-cg-demo-api-key`** | Same endpoint, higher limit (100 calls/min, 10k calls/month on the public pricing page), attribution required. Only if a local gitignored override sets it. |
| CoinGecko WebSocket, Pro, `/market_chart`, `/ohlc` | Different product (live tape or history) and mostly paid. |

---

## 4. Proposed direction

Defaults:

- Stay on Angular 22.2.x, TypeScript 6.0.x, RxJS 7.8, Node 24 (`.nvmrc`).
- Standalone components only. This app is already standalone.
- Zoneless. Remove `zone.js`. Delete `changeDetection: ChangeDetectionStrategy.Eager` so components use the v22 OnPush default.
- Tailwind CSS 4, configured with PostCSS the way the Angular 22 docs describe. No `tailwind.config.js`.
- One `@Injectable` service owns the HTTP resource. The page owns view signals. Pure functions own the rules.
- Chart.js 4, tree-shaken. Tooltip text stays "name + market cap".
- Client rendering only. Remove the unused SSR packages.
- Vitest through the Angular unit-test builder.
- Keyless CoinGecko by default. No key in the repository.

### Shape

```text
src/app/crypto/
  crypto-market.model.ts     # CoinMarket, MarketQuery
  crypto-market.service.ts   # query signal + httpResource
  crypto-view.ts             # filter, sort, page, chart series, formats
  crypto-view.spec.ts
src/app/pages/dashboard/
  dashboard.page.ts          # search, sort, page signals; composes children
  dashboard.page.html
  market-cap-chart.component.ts
  coin-table.component.ts
```

Delete `src/app/state/`, the Material dashboard component, `is-json.utils.ts`, and the `@pf-app/store` and `@pf-app/pipes` aliases. Keep `@pf-app/*` for models, services, and utils that remain.

`CryptoMarketService`:

- `query` is a signal. Initial value matches today's request: `{ vsCurrency: 'usd', order: 'market_cap_desc', perPage: 250, page: 1, sparkline: false }`.
- `markets` is an `httpResource` that GETs `environment.apiUrl` with those params. When a demo key is configured, send it as the `x-cg-demo-api-key` header.
- Drop `withXhr()`. Angular 22's Fetch backend is the right client for this JSON GET.
- A currency control updates `query` and therefore refetches. Search, sort, and pagination do not.
- Call `reload()` from an explicit Refresh button only. No timer.

`DashboardPage` signals:

- `search`, `sort` (`{ column, direction } | null`), `pageIndex`, `pageSize` (default 10).
- `visibleRows = computed(...)` using the pure functions on `markets.value()`.
- Reset `pageIndex` to 0 when the search query or page size changes.
- Empty sort direction means the API order (market cap descending), which is the order of the payload.

Child components take `input()` signals (`rows` for the chart and the table). The chart's `effect()` creates the Chart.js instance on the canvas after render and updates it when `rows` changes. Destroy the chart with the component.

Templates use `@if` / `@for`. Three visible states, each with its own block:

- `markets.isLoading()` and no value yet: a text status, "Loading markets".
- `markets.error()`: the message and a Retry button that calls `reload()`.
- value present: chart, search, table, paginator. A search that matches nothing leaves the chrome up and shows an empty row message.

Formatting is `Intl.NumberFormat` inside `crypto-view.ts`, so tests do not depend on Angular locale data. Map `usd` / `eur` to `USD` / `EUR`. Render 24h change from the raw percentage with a sign and a `%` suffix (`1.5` → `+1.5%`). Render `null` numbers as an em dash. Keep `CurrencyPipe` out of the 24h column.

Styling: Tailwind utilities on the page, one `@theme` block for the background, surface, text, positive change, and negative change. Font is the Tailwind system stack. Remove the Google Fonts stylesheets with Material. Layout goal is the one already in the component CSS: column on small screens, chart and table side by side from `1024px` (`lg:`).

ESLint after NgRx is gone: remove `@ngrx/eslint-plugin` and the rule overrides that exist only to allow `withLatestFrom`, constructor injection, and `Eager`. Prefer `inject()`. Set the directive prefix to `pf` so it matches the component prefix. Include `*.spec.ts` again.

### Alternatives left on the table

- Keep Highcharts if a paid license is already owned. Nothing in the repo shows one.
- Use ECharts the day the chart stops being a single bar series.
- Use NgRx SignalStore if a later feature adds several independent client caches. That would be a new decision, not this plan.

---

## 5. Phased implementation

Each step ends with `npm run lint`, `npm test`, and `npm run build` on Node 24. CI should stay green. Do not combine a step with the next one in a single commit.

### Phase 1 — Lock the behavior, delete dead weight

The UI stack stays Material, NgRx, Highcharts, Karma, and Zone for this phase. The point is a contract the rewrite cannot quietly drop, plus dependencies that no screen imports.

1. **Add `src/app/crypto/crypto-view.ts` and its spec.** Pure functions only.
   - Filter: case-insensitive match on name or symbol; empty query returns the input order.
   - Sort: numeric columns compare as numbers; name and symbol compare as strings; `null` sorts last; direction `''` or `null` returns the input order.
   - Page slice: page index 2 and size 5 returns items `[10, 15)`.
   - Chart series: categories are coin ids, data is market cap, taken from the page slice (use `0` when market cap is `null` so the chart still draws).
   - Percent label: `1.5` → `+1.5%`, `-0.2` → `-0.2%`, `null` → em dash.
   - Price label: USD and EUR currency formatting; `null` → em dash.
   - Gate: `npm test` runs these cases without TestBed.

2. **Point the current dashboard at those functions.**
   - Replace the in-component sort copy in `updateChart`.
   - Call the chart update from the paginator `page` event and from search, and reset to the first page on a new query.
   - Render the 24h cell with the percent helper. Leave the other cells on Angular pipes until Phase 2.
   - Gate: the pure tests still pass, and a component test (or a direct call of the same helpers the template uses) shows page 2's categories differ from page 1's.

3. **Remove unused code and packages.** Behavior of the screen stays.
   - Delete `isJson` and its spec.
   - Drop the unused `MatSelectModule` import.
   - Remove `HttpClient` from `AppComponent.providers`.
   - Remove `provideAnimationsAsync()` and keep a single `provideAnimations()` until Material is gone.
   - Uninstall `@ngrx/entity` and `@ngrx/component-store`.
   - Remove `provideClientHydration`, then uninstall `@angular/ssr`, `@angular/platform-server`, `express`, and `@types/express`.
   - Delete the `@pf-app/pipes` path.
   - Gate: production `ng build` still emits the browser app, `npm test` stays green, and `src/` no longer imports the deleted packages.

Leave `updateParams` in place until Phase 2 deletes the store. Do not spend this phase polishing Material markup.

### Phase 2 — Core architecture

4. **Move tests to Vitest** while Zone, NgRx, and Material are still there, so this commit is only the runner.
   - Follow the Angular CLI Karma-to-Vitest migration (`@angular/build:unit-test`).
   - Replace the `fakeAsync` / `tick` use in the dashboard spec with `await fixture.whenStable()`.
   - Keep the marble tests alive for this one step if the migration supports them. They disappear in step 5.
   - Delete `karma.conf.js` and the Karma packages when the suite is green.
   - Gate: `npm test` is non-interactive, exits 0, and CI still calls it.

5. **Replace NgRx with `CryptoMarketService`.** Keep Zone and the Material screen for this commit. The component reads the resource (`value`, `isLoading`, `error`) instead of the store, and it stops writing the table from inside `tap`.
   - Implement the service in section 4. The dashboard injects it. `AppComponent` no longer dispatches, and it no longer needs `Store` or a component-level `HttpClient`.
   - Http tests with `provideHttpClientTesting` / `HttpTestingController`:
     - constructing the service issues one GET whose query string contains `vs_currency=usd`, `per_page=250`, `page=1`, `order=market_cap_desc`, `sparkline=false`
     - updating `query` to `eur` issues a second request and does not duplicate the first
     - a 500 leaves `error` set and `value` empty
     - a 429 leaves an error the template can show
   - Delete `src/app/state`, the NgRx packages, `jasmine-marbles`, and the NgRx ESLint plugin and rules.
   - Gate: the old reducer and effect specs are gone, the HTTP tests above pass, and the Material screen still loads.

6. **Replace Material and Highcharts with Tailwind v4 and Chart.js.** Zone can stay through this commit so a missed signal shows up as a normal change-detection bug rather than a zoneless one.
   - Install Tailwind 4 the Angular way. `@import "tailwindcss"` in `src/styles.css`. Add a `@theme` for the few color tokens. No `tailwind.config.js`.
   - Install `chart.js` 4. Register only the bar-chart pieces listed in section 4.
   - Build the page, chart, and table from section 4. Delete `crypto-dash`, the indigo-pink stylesheet, the Material and CDK packages, `@angular/animations`, both animation providers, `highcharts`, and `highcharts-angular`.
   - Remove the Roboto and Material Icons `<link>` tags.
   - Loading, error, and empty-search states render as specified.
   - Add the USD/EUR control. It is the one new control, because `CryptoParams.vs_currency` already exists and has never been reachable.
   - Gate: a component test types into the search box and asserts the rendered row count, and asserts the error block on a flushed HTTP failure. `npm run build` stays inside the current budgets (warning 500kb, error 1mb). If the budget fails, tree-shake Chart.js further in this step.

7. **Remove Zone** only after step 6, when templates read signals and nothing updates the screen from a `tap`.
   - Remove `zone.js` and `zone.js/testing` from `angular.json` and `package.json`.
   - On an upgraded app, zoneless is not automatic. Add `provideZonelessChangeDetection()` if change detection does not run after the polyfill is gone. Delete that provider if Angular 22 already defaults to zoneless once `zone.js` is absent. Check the [zoneless guide](https://angular.dev/guide/zoneless) at implementation time and record which one happened in the commit message.
   - Remove `ChangeDetectionStrategy.Eager`.
   - Gate: tests use `whenStable()`, a manual `npm run start:dev` load paints the table after the request resolves, and the production bundle contains neither `zone.js`, `@angular/material`, `@ngrx`, nor `highcharts`.

### Phase 3 — Polish

8. **Layout and theme.** Match the current breakpoints with Tailwind (`flex-col`, `lg:flex-row`, chart min-height). Use Tailwind v4's default `dark` variant (`prefers-color-scheme`). No theme toggle.
   - Gate: at a viewport under 1024px the chart sits above the table; at 1280px they sit side by side. Check both in a browser.

9. **Accessibility.** Associate a `<label>` with the search box. Sort buttons expose `aria-sort`. The chart canvas has an accessible name. The error state is text, not color alone. Positive and negative 24h changes are not color-only (the sign is already in the label).
   - Gate: keyboard users can search, sort, change page, and retry. `npm run lint` template accessibility rules stay on.

10. **Attribution, optional demo key, README, lint cleanup.**
    - Footer link to CoinGecko. Demo-plan attribution is required if a key is used; show the credit either way.
    - Optional key: gitignored environment override only, sent as a header. Document that a key shipped in a static bundle is public and will share its quota. Default remains keyless and key-free.
    - Rewrite the README so it describes how to run the app, the Node version, keyless limits, and the decision not to poll. Remove the "tests exist only for coverage" disclaimer once the Phase 1–2 tests are the real suite. Update the badges when Material, NgRx, and Highcharts are gone.
    - Stop ignoring spec files in ESLint. Fix what that surfaces. Re-enable the inject and OnPush rules that `eslint.config.js` currently turns off, or delete those overrides if the defaults are already correct.
    - Gate: CI on the pull request is green, and a fresh `npm ci && npm test && npm run build` matches it.

---

## 6. Out of scope / risks

Out of scope:

- Accounts, auth, watchlists, portfolios, alerts, trading, or any second route.
- Polling, WebSockets, or CoinGecko's paid real-time plans.
- Sparklines, OHLC, and `/coins/{id}/market_chart`. `sparkline` stays `false`.
- Server-driven paging. The product is one markets page (`per_page=250`, `page=1`) sliced in the browser. Do not shrink that to 100 unless keyless requests fail in the Phase 2 manual check, and then record the new value in the README.
- SSR, prerender, and hydration.
- PrimeNG, Angular Material, NgRx (including SignalStore), Zone.js.
- ng2-charts, AG Grid, and a Tailwind v3 config.
- Signal Forms, `@boundary`, router resources, and the `@Service` decorator.
- Raising the production bundle budgets to make a large chart library fit.
- Dependency upgrades beyond what the steps above name.

Risks:

- **Keyless rate limits.** Reloading the dev server repeats the 250-row call. Search must not multiply that. A 429 has to be visible. A demo key in the browser is not a secret; do not commit one, and do not describe it as private.
- **CoinGecko terms.** Keep their attribution when a demo key is used. The endpoint and field meanings can change; the model should list the fields this UI reads and ignore the rest.
- **Highcharts license** if step 6 is skipped and the app is deployed as a public or commercial site. Personal and educational use is the free tier in the January 2026 EULA.
- **Zoneless plus leftover `Eager` or RxJS `tap` side effects.** The current component writes `MatTableDataSource` inside a `tap`. That pattern goes stale under zoneless. Step 7 removes Zone only after step 6's templates read signals.
- **The percent fix changes numbers on screen.** That is the correction. Call it out in the Phase 1 commit so it is not treated as a regression.
- **`jasmine-marbles` 0.9.2** is unmaintained. It leaves with the effects.
- **ESLint ignores every spec.** Turning that off will fail lint once. Fix the findings in step 10.
- **Google Fonts.** Removing the CDN changes the typeface and drops a third-party request. Intended.
- **No special hardware.** Chrome is only required while Karma remains. After Vitest + jsdom, CI does not need a browser unless a later test opts into browser mode.
- **Secrets.** `environment.ts` holds a public URL. `.gitignore` already ignores `.env`. Keep keys out of both files that are committed.

---

## 7. Success criteria

The work is done when all of the following are true:

1. `npm run start:dev` loads `/crypto-dashboard` and shows names and prices from CoinGecko, or a visible error if the request fails.
2. The network log shows one `/coins/markets` request on load. Typing in search, sorting a column, and changing page do not send another. Switching USD/EUR sends one new request. Refresh sends one new request.
3. Search matches name and symbol, ignores case, and resets to the first page. Page sizes are 5, 10, and 25. The chart's categories match the visible page, including after a page change and after a search.
4. A unit test locks the 24h label: input `1.5` renders `+1.5%`, input `-0.2` renders `-0.2%`.
5. Forced HTTP 500 and a search with no matches each render their own state. Loading text is visible before the first successful value.
6. `npm test` is Vitest, exits 0, and includes the pure view tests, the HTTP tests in step 5, and the component test in step 6 that filters rows.
7. `npm run lint` and `npm run build` succeed on Node 24. The production bundle stays inside the current budgets and does not contain `zone.js`, `@angular/material`, `@ngrx`, or `highcharts`.
8. CI runs those three commands and is green.
9. The README matches the commands, the Node version, and the keyless usage limits. No API key is committed.
10. Layout: stacked under 1024px, side by side from 1024px up, readable with the system dark preference, usable from the keyboard.

---

## Sources

- [Angular v22 announcement](https://blog.angular.dev/announcing-angular-v22-c52bb83a4664) (3 June 2026)
- [What's new in Angular 22.2](https://blog.ninja-squad.com/2026/09/23/what-is-new-angular-22.2) (23 September 2026)
- [Angular version compatibility](https://angular.dev/reference/versions)
- [Zoneless guide](https://angular.dev/guide/zoneless)
- [Tailwind in Angular](https://angular.dev/guide/tailwind)
- [Migrating from Karma to Vitest](https://angular.dev/guide/testing/migrating-to-vitest)
- [CoinGecko keyless API](https://docs.coingecko.com/docs/keyless-public-api)
- [CoinGecko API pricing](https://www.coingecko.com/en/api/pricing) (Demo limits and attribution)
- [Highcharts EULA 1.0](https://shop.highcharts.com/license-eula-1.0.pdf) (20 January 2026)
