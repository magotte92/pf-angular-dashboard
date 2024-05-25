type Range<
  N extends number,
  Acc extends number[] = [],
> = Acc['length'] extends N ? Acc : Range<N, [...Acc, Acc['length']]>;
type NumberToString<N extends number> = `${N}`;
export type Max250 = NumberToString<Range<251>[number]>;
