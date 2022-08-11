import { isPositivePoint, Point, sum, S } from './semigroup';
import { option as O } from 'fp-ts';

it('[isPositivePoint] should be return true', () => {
  const point: Point = {
    x: 1,
    y: 2,
  };

  expect(isPositivePoint(point)).toBeTruthy();
});

it('[isPositivePoint] should be return false', () => {
  const point: Point = {
    x: -1,
    y: 2,
  };

  expect(isPositivePoint(point)).toBeFalsy();
});

it('[sum] should be return sum total', () => {
  const a = [1, 2, 3];

  expect(sum(a)).toBe(6);
});

// it('should be merge `Option`', () => {
//   expect(S.concat(O.some(1), O.none)).toEqual(O.none);
//   expect(S.concat(O.some(1), O.some(2))).toEqual(O.some(3));
// });
