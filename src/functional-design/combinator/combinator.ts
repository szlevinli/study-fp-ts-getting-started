import { Eq, fromEquals } from 'fp-ts/Eq';
import { getApplicativeMonoid } from 'fp-ts/Applicative';
import { IO, Applicative as ioApplicative, chain as ioChain } from 'fp-ts/IO';
import { Monoid, monoidVoid, concatAll } from 'fp-ts/Monoid';
import { replicate } from 'fp-ts/ReadonlyArray';
import { randomInt } from 'fp-ts/Random';
import { pipe } from 'fp-ts/function';

// Example `Eq`
export const getEq = <A>(E: Eq<A>): Eq<ReadonlyArray<A>> =>
  fromEquals(
    (xs, ys) =>
      xs.length === ys.length && xs.every((x, i) => E.equals(x, ys[i]))
  );

export const contramap: <A, B>(f: (b: B) => A) => (E: Eq<A>) => Eq<B> =
  (f) => (E) =>
    fromEquals((x, y) => E.equals(f(x), f(y)));

// Example `Monoid`
export const getMonoid = <A>(M: Monoid<A>): Monoid<IO<A>> =>
  getApplicativeMonoid(ioApplicative)(M);

export const replicateIO =
  (n: number) =>
  (mv: IO<void>): IO<void> =>
    concatAll(getMonoid(monoidVoid))(replicate(n, mv));

export const log =
  (msg: unknown): IO<void> =>
  () =>
    console.log(String(msg));

// curry
const fibonacci_ =
  (ac1: number) =>
  (ac2: number) =>
  (n: number): number =>
    n <= 1 ? ac2 : fibonacci_(ac2)(ac1 + ac2)(n - 1);

export const fibonacci = fibonacci_(1)(1);

export const printFib: IO<void> = pipe(
  randomInt(30, 35),
  ioChain((n) => log(fibonacci(n)))
);
