import { now } from 'fp-ts/Date';
import { IO, Monad } from 'fp-ts/IO';

export const time = <A>(ma: IO<A>): IO<[A, number]> =>
  Monad.chain(now, (start) =>
    Monad.chain(ma, (a) => Monad.map(now, (end) => [a, end - start]))
  );
