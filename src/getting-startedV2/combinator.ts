import {
  applicative as Apt,
  apply as Ap,
  console as Csl,
  date as Dt,
  io as IO,
  monoid as Mid,
  monadIO as MIO,
  number as Num,
  ord as Ord,
  random as Rdm,
  readonlyArray as RA,
  semigroup as Se,
  task as T,
  void as V,
} from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { Kind, URIS, HKT } from 'fp-ts/HKT';

/**
 * 构建 `IO<void>` 的 `Monoid` 的实例
 *
 * `Monoid<IO<void>>`
 */
const monoidIOVoid: Mid.Monoid<IO.IO<void>> = Apt.getApplicativeMonoid(
  IO.Applicative
)(V.Monoid);

const replicateIO = (n: number) => (mv: IO.IO<void>) =>
  Mid.concatAll(monoidIOVoid)(RA.replicate(n, mv));

const fib = (n: number): number => (n <= 1 ? 1 : fib(n - 1) + fib(n - 2));

const printFib: IO.IO<void> = pipe(
  Rdm.randomInt(30, 35),
  IO.chain((n) => Csl.log(fib(n)))
);

// replicateIO(3)(printFib)();

/**
 * time
 */
const time = <A>(ma: IO.IO<A>): IO.IO<A> =>
  IO.Monad.chain(Dt.now, (start) =>
    IO.Monad.chain(ma, (a) =>
      IO.Monad.chain(Dt.now, (end) =>
        IO.Monad.map(Csl.log(`Elapsed: ${end - start}`), () => a)
      )
    )
  );

// time(replicateIO(3)(printFib))();

// time(replicateIO(3)(time(printFib)))();

/**
 * There are two problems with this `time` combinator:
 *
 * - is not flexible, i.e. consumers can't choose what to do with the elapsed time
 * - works with `IO` only
 */

/**
 * Tackle the first problem.
 *
 * Adding flexibility by returning the elapsed time.
 *
 * Instead of always logging, we can return the elapsed time along with the
 * computed value
 */
const timeV2 = <A>(ma: IO.IO<A>): IO.IO<[A, number]> =>
  IO.Monad.chain(Dt.now, (start) =>
    IO.Monad.chain(ma, (a) => IO.Monad.map(Dt.now, (end) => [a, end - start]))
  );

const withLogging = <A>(ma: IO.IO<A>): IO.IO<A> =>
  IO.Monad.chain(timeV2(ma), ([a, elapsed]) =>
    IO.Monad.map(Csl.log(`Result: ${a}, Elapsed: ${elapsed}`), () => a)
  );

const ignoreSnd = <A>(ma: IO.IO<[A, unknown]>): IO.IO<A> =>
  IO.Monad.map(ma, ([a]) => a);

const fastest = <A>(head: IO.IO<A>, tail: Array<IO.IO<A>>): IO.IO<A> => {
  const ordTuple = Ord.contramap(([_, elapsed]: [A, number]) => elapsed)(
    Num.Ord
  );
  const semigroupTuple = Se.min(ordTuple);
  const semigroupIO = Ap.getApplySemigroup(IO.Apply)(semigroupTuple);
  const fastest_ = Se.concatAll(semigroupIO)(timeV2(head))(tail.map(timeV2));
  return ignoreSnd(fastest_);
};

const timeTaglessFinal = <M extends URIS>(
  M: MIO.MonadIO<M>
): (<A>(ma: HKT<M, A>) => HKT<M, [A, number]>) => {
  const now = M.fromIO(Dt.now);
  return (ma) =>
    M.chain(now, (start) =>
      M.chain(ma, (a) => M.map(now, (end) => [a, end - start]))
    );
};
