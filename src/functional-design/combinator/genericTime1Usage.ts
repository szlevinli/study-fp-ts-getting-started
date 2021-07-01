import { getApplySemigroup } from 'fp-ts/Apply';
import { log } from 'fp-ts/Console';
import { Apply as applyIO, IO, Monad } from 'fp-ts/IO';
import { Ord as ordNumber } from 'fp-ts/number';
import { contramap } from 'fp-ts/Ord';
import { randomInt } from 'fp-ts/Random';
import { concatAll, min } from 'fp-ts/Semigroup';
import { time } from './genericTime1';

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

const fib = (n: number): number => (n <= 1 ? 1 : fib(n - 1) + fib(n - 2));

const program = withLogging(Monad.map(randomInt(30, 35), fib));

// program();

const fastestProgram = Monad.chain(fastest(program, [program, program]), (a) =>
  log(`Fastest result is: ${a}`)
);

fastestProgram();
