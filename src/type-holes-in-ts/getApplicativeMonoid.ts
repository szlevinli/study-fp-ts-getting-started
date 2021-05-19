import { Applicative, Applicative2C } from 'fp-ts/Applicative';
import { Monoid } from 'fp-ts/Monoid';
import { HKT, URIS2, Kind2 } from 'fp-ts/HKT';
import { getApplySemigroup } from 'fp-ts/Apply';

declare function _<T>(): T;

// const getApplicativeMonoid = <F>(
//   F: Applicative<F>
// ): (<A>(M: Monoid<A>) => Monoid<HKT<F, A>>) => {
//   const f = getApplySemigroup(F);
//   return (ma) => ({
//     concat: f(ma).concat,
//     empty: F.of(ma.empty),
//   });
// };

export function getApplicativeMonoid<F extends URIS2, E>(
  F: Applicative2C<F, E>
): <A>(M: Monoid<A>) => Monoid<Kind2<F, E, A>>;

export function getApplicativeMonoid<F>(
  F: Applicative<F>
): <A>(M: Monoid<A>) => Monoid<HKT<F, A>>;

export function getApplicativeMonoid<F>(
  F: Applicative<F>
): <A>(M: Monoid<A>) => Monoid<HKT<F, A>> {
  const f = getApplySemigroup(F);
  return <A>(M: Monoid<A>) => ({
    concat: f(M).concat,
    empty: F.of(M.empty),
  });
}
