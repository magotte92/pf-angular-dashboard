# Crypto Dashboard
[![Angular](https://img.shields.io/badge/Angular-v17.3-f51954?logo=angular&logoColor=f51954)](https://angular.io/)
[![Angular Material](https://img.shields.io/badge/Angular%20Material-v17.3.0-055cb7?logo=angular&logoColor=055cb7)](https://material.angular.io/)
[![NgRx](https://img.shields.io/badge/NgRx-v17.2-5c207d?logo=ngrx&logoColor=5c207d)](https://ngrx.io/)
[![RxJS](https://img.shields.io/badge/RxJS-v7.8-fc108f?logo=reactivex&logoColor=fc108f)](https://rxjs.dev/)
[![Highcharts](https://img.shields.io/badge/Highcharts-v4-6799a0?logo=highcharts&logoColor=6799a0)](https://www.highcharts.com/)

## Description

This project is an Angular-based dashboard application that fetches data from the CoinGecko API and displays it in a data table with filtering, sorting, search, and pagination functionalities. It also visualizes the data in a chart using Highcharts. The state management is handled using NgRx, and RxJS is used for data transportation and manipulation.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run start:dev`

## Testing
To perform test with code coverage and headless browser `npm run test`.

---

**Disclaimer:** The tests are written with tools for demonstration purposes on achieving high test coverage in such short time

---
## Linting and formatting
* Perform lint check `npm run lint`
* Autofix issues `npm run lint:fix`
* Format the whole application `npm run format`
---

**Disclaimer:** Linting and formatting are purely for demonstration purposes. The ideal use of these tools would be in a pipeline or using SonarQube for even better results.

---

## Production Build

1. Build the project: `ng build`

