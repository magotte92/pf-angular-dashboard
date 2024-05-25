import { Pipe, PipeTransform } from '@angular/core';
import { DISPLAYED_COLUMNS } from '@pf-app/components';
import { CryptoCoin } from '@pf-app/models';

@Pipe({
  name: 'columnRow',
  standalone: true,
})
export class ColumnRowPipe implements PipeTransform {
  transform(value: string): boolean {
    return DISPLAYED_COLUMNS.includes(value as keyof CryptoCoin);
  }
}
