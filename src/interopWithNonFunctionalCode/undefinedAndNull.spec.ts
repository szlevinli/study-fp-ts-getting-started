import { find } from './undefinedAndNull';
import { isNone, isSome, getOrElse, Option } from 'fp-ts/Option';

const predicate = (a: number) => (b: number) => a === b;

it('should be return `Option.some`', () => {
  const data = [1, 2, 3];
  const has3 = predicate(3);
  const result = find(has3, data) as Option<number>;
  expect(isSome(result)).toBeTruthy();
  expect(getOrElse(() => NaN)(result)).toBe(3);
});

it('should be return `Option.none`', () => {
  const data = [1, 2, 3];
  const has5 = predicate(5);
  const result = find(has5, data) as Option<number>;
  expect(isNone(result)).toBeTruthy();
  expect(getOrElse(() => NaN)(result)).toBeNaN();
});
