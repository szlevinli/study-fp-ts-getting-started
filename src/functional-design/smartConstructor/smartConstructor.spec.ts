import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { makeInt, makeNonEmptyString, person } from './smartConstructor';

it('should be create instance of `Person`', () => {
  const myName = makeNonEmptyString('levin');
  const myAge = makeInt(18);
  const levin = O.Monad.chain(myName, (name) =>
    O.Functor.map(myAge, (age) => person(name, age))
  );

  expect(O.isSome(levin)).toBeTruthy();
  expect(
    pipe(
      levin,
      O.getOrElseW(() => null)
    )
  ).toEqual({
    name: 'levin',
    age: 18,
  });
});

it('should be create `None`', () => {
  const myName = makeNonEmptyString('levin');
  const myAge = makeInt(-18);
  const levin = O.Monad.chain(myName, (name) =>
    O.Functor.map(myAge, (age) => person(name, age))
  );

  expect(O.isNone(levin)).toBeTruthy();
  expect(
    pipe(
      levin,
      O.getOrElseW(() => null)
    )
  ).toBeNull();
});
