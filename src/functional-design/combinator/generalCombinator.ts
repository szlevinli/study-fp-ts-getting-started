import { IO, Monad, Apply as applyIO } from 'fp-ts/IO';
import { now } from 'fp-ts/Date';
import { log } from 'fp-ts/Console';
import { concatAll, min, Semigroup } from 'fp-ts/Semigroup';
import { contramap } from 'fp-ts/Ord';
import { Ord as ordNumber } from 'fp-ts/number';
import { getApplySemigroup } from 'fp-ts/Apply';

export const time = <A>(ma: IO<A>): IO<[A, number]> =>
  Monad.chain(now, (start) =>
    Monad.chain(ma, (a) => Monad.map(now, (end) => [a, end - start]))
  );

export const withLogging = <A>(ma: IO<A>): IO<A> =>
  Monad.chain(time(ma), ([a, milliseconds]) =>
    Monad.map(log(`Result: ${a}, Elapsed: ${milliseconds}`), () => a)
  );

export const ignoreTime = <A>(ma: IO<[A, unknown]>): IO<A> =>
  Monad.map(ma, ([a]) => a);

export const fastest = <A>(head: IO<A>, tail: Array<IO<A>>): IO<A> => {
  const ordTuple = contramap(([_, elapsed]: [A, number]) => elapsed)(ordNumber);
  const semigroupTuple = min(ordTuple);
  const semigroupIO = getApplySemigroup(applyIO)(semigroupTuple);
  const fastest = concatAll(semigroupIO)(time(head))(tail.map(time));
  return ignoreTime(fastest);
};
