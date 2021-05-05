import { getOrElse, isNone, isSome } from 'fp-ts/Option';
import { find } from './undefinedAndNull';

const predicate = (a: number) => (b: number) => a === b;

it('should be return `Option.some`', () => {
  const data = [1, 2, 3];
  const has3 = predicate(3);
  const find3 = find(has3);
  const result = find3(data);
  expect(isSome(result)).toBeTruthy();
  expect(getOrElse(() => NaN)(result)).toBe(3);
});

it('should be return `Option.none`', () => {
  const data = [1, 2, 3];
  const has5 = predicate(5);
  const find5 = find(has5);
  const result = find5(data);
  expect(isNone(result)).toBeTruthy();
  expect(getOrElse(() => NaN)(result)).toBeNaN();
});
