// column-row.pipe.spec.ts
import { ColumnRowPipe } from './column-row.pipe';
import { DISPLAYED_COLUMNS } from '@pf-app/components';
import { CryptoCoin } from '@pf-app/models';

describe('ColumnRowPipe', () => {
  let pipe: ColumnRowPipe;

  beforeEach(() => {
    pipe = new ColumnRowPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true if the column is in DISPLAYED_COLUMNS', () => {
    const column = DISPLAYED_COLUMNS[0];
    expect(pipe.transform(column)).toBe(true);
  });

  it('should return false if the column is not in DISPLAYED_COLUMNS', () => {
    expect(pipe.transform('nonExistentColumn')).toBe(false);
  });
});
