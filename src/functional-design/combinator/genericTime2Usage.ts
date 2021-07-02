import * as IO from 'fp-ts/IO';
import * as T from 'fp-ts/Task';
import { time } from './genericTime2';
import { fib } from './helper';
import { log } from 'fp-ts/Console';
import { randomInt } from 'fp-ts/Random';

export const timeIO = time(IO.MonadIO);
export const taskIO = time(T.MonadIO);

export const withLog = <A>(ma: IO.IO<A>): IO.IO<A> =>
  IO.Monad.chain(timeIO(ma), ([a, milliseconds]) =>
    IO.Monad.map(log(`IO Result: ${a}, Elapsed: ${milliseconds}`), () => a)
  );

export const withLog2 = <A>(ma: T.Task<A>): T.Task<A> =>
  T.Monad.chain(taskIO(ma), ([a, milliseconds]) =>
    T.Monad.map(
      T.fromIO(log(`Task Result: ${a}, Elapsed: ${milliseconds}`)),
      () => a
    )
  );

const program1 = withLog(IO.Monad.map(randomInt(30, 35), fib));
const program2 = withLog2(T.Monad.map(T.fromIO(randomInt(30, 35)), fib));

program1();
program2();
T.delay(3000)(program2)();
