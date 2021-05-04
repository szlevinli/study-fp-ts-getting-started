import { findIndex } from './sentinels';
import { isNone, isSome } from 'fp-ts/Option';

const predicate = (a: number) => (b: number) => a === b;

it('should be return Option.some', () => {
  const data = [1, 2, 3];
  const has3 = predicate(3);
  const result = findIndex(has3, data);
  expect(isSome(result)).toBeTruthy();
});

it('should be return Option.none', () => {
  const data = [1, 2, 3];
  const has5 = predicate(5);
  const result = findIndex(has5, data);
  expect(isNone(result)).toBeTruthy();
});
