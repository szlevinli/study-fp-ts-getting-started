import { now } from 'fp-ts/Date';
import { Kind, URIS } from 'fp-ts/HKT';
import { MonadIO1 } from 'fp-ts/MonadIO';

export const time = <M extends URIS>(
  M: MonadIO1<M>
): (<A>(ma: Kind<M, A>) => Kind<M, [A, number]>) => {
  const liftedNow = M.fromIO(now);
  return (ma) =>
    M.chain(liftedNow, (start) =>
      M.chain(ma, (a) => M.map(liftedNow, (end) => [a, end - start]))
    );
};
