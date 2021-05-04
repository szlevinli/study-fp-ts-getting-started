import { findIndex } from './sentinels';
import { isNone, isSome } from 'fp-ts/Option';

it('should be return Option.some', () => {
  const data = [1, 2, 3];
  const result = findIndex(data, (v) => v === 3);
  expect(isSome(result)).toBeTruthy();
});

it('should be return Option.none', () => {
  const data = [1, 2, 3];
  const result = findIndex(data, (v) => v === 5);
  expect(isNone(result)).toBeTruthy();
});
