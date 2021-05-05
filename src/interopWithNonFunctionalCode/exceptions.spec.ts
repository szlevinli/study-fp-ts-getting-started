import { parse } from './exceptions';
import { isLeft, isRight, getOrElse } from 'fp-ts/Either';

it('should be return `Either.Right`', () => {
  const data = '{"a": 1}';
  const result = parse(data);

  expect(isRight(result)).toBeTruthy();
  expect(getOrElse(() => ({}))(result)).toEqual({ a: 1 });
});

it('should be return `Either.Left`', () => {
  const data = '{"a": 1';
  const result = parse(data);

  expect(isLeft(result)).toBeTruthy();
  expect(getOrElse(() => ({}))(result)).toEqual({});
});
