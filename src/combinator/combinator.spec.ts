import { getEq, getMonoid, fibonacci } from './combinator';
import { Eq as eqNumber, MonoidSum } from 'fp-ts/number';
import { of as ioOf } from 'fp-ts/IO';

it('[getEq] Eq<number> to Eq<ReadonlyArray<number>>', () => {
  const result = getEq(eqNumber);

  expect(result.equals([1, 2, 3], [1, 2, 3])).toBeTruthy();
  expect(result.equals([1, 2, 3], [2, 1, 3])).toBeFalsy();
});

it('[getMonoid] Monoid<number> to Monoid<IO<number>>', () => {
  const ioA = ioOf(5);
  const ioB = ioOf(5);

  const ioMonoid = getMonoid(MonoidSum);
  const result = ioMonoid.concat(ioA, ioB)();

  expect(result).toBe(10);
});
