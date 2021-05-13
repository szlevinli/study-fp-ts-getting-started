import { getEq, getMonoid, contramap } from './combinator';
import { Eq as eqNumber, MonoidSum } from 'fp-ts/number';
import { Eq as eqBoolean } from 'fp-ts/boolean';
import { of as ioOf } from 'fp-ts/IO';
import { pipe } from 'fp-ts/function';
import { Eq } from 'fp-ts/Eq';

it('[getEq] Eq<number> to Eq<ReadonlyArray<number>>', () => {
  const result = getEq(eqNumber);

  expect(result.equals([1, 2, 3], [1, 2, 3])).toBeTruthy();
  expect(result.equals([1, 2, 3], [2, 1, 3])).toBeFalsy();
});

it('[contramap] Eq<number> to Eq<boolean>', () => {
  const eq = contramap<boolean, number>((x) => x >= 10)(eqBoolean);

  expect(eq.equals(11, 12)).toBeTruthy();
  expect(eq.equals(9, 12)).toBeFalsy();
  expect(eq.equals(5, 6)).toBeTruthy();
});

it('[contramap] Eq<number> to Eq<User>', () => {
  type User = {
    id: number;
    name: string;
  };

  const eqUser: Eq<User> = pipe(
    eqNumber,
    contramap((user: User) => user.id)
  );

  const user1 = { id: 1, name: 'levin' };
  const user2 = { id: 1, name: 'jack' };
  const user3 = { id: 3, name: 'emma' };

  expect(eqUser.equals(user1, user2)).toBeTruthy();
  expect(eqUser.equals(user1, user3)).toBeFalsy();
});

it('[getMonoid] Monoid<number> to Monoid<IO<number>>', () => {
  const ioA = ioOf(5);
  const ioB = ioOf(5);

  const ioMonoid = getMonoid(MonoidSum);
  const result = ioMonoid.concat(ioA, ioB)();

  expect(result).toBe(10);
});
