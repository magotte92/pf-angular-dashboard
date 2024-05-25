import { Pipe, PipeTransform } from '@angular/core';
import { CryptoCoin } from '@pf-app/models';

@Pipe({
  name: 'columnName',
  standalone: true,
})
export class ColumnNamePipe implements PipeTransform {
  transform(value: CryptoCoin, column: keyof CryptoCoin): string {
    if (column in value) {
      return value[column].toString();
    }
    return '';
  }
}
