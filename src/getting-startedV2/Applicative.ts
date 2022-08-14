import { functor, array, option as O, task as T, apply, number } from 'fp-ts';
import { HKT } from 'fp-ts/HKT';
import { Option } from 'fp-ts/lib/Option';

/**
 * Apply
 * `ap: F<(c: C) => D> => F<C> => F<D>`
 */
interface Apply<F> extends functor.Functor<F> {
  ap: <C, D>(fcd: HKT<F, (c: C) => D>, fc: HKT<F, C>) => HKT<F, D>;
}

/**
 * Applicative
 * `ap: F<(c: C) => D> => F<C> => F<D>`
 * `of: (a: A) => F<A>`
 */
interface Applicative<F> extends Apply<F> {
  of: <A>(a: A) => HKT<F, A>;
}

// Example (`F = Array`)
const applicativeArray = {
  map: <A, B>(fa: Array<A>, f: (a: A) => B): Array<B> => fa.map(f),
  of: <A>(a: A): Array<A> => [a],
  ap: <A, B>(fab: Array<(a: A) => B>, fa: Array<A>): Array<B> =>
    array.flatten(fab.map((f) => fa.map(f))),
};

// Example (`F = Option`)
const applicativeOption = {
  map: <A, B>(fa: O.Option<A>, f: (a: A) => B): O.Option<B> =>
    O.isNone(fa) ? O.none : O.some(f(fa.value)),
  of: <A>(a: A): O.Option<A> => O.some(a),
  ap: <A, B>(fab: O.Option<(a: A) => B>, fa: O.Option<A>): O.Option<B> =>
    O.isNone(fab) ? O.none : applicativeOption.map(fa, fab.value),
};

// Example (`F = Task`)
const applicativeTask = {
  map:
    <A, B>(fa: T.Task<A>, f: (a: A) => B): T.Task<B> =>
    () =>
      fa().then(f),
  of:
    <A>(a: A): T.Task<A> =>
    () =>
      Promise.resolve(a),
  ap:
    <A, B>(fab: T.Task<(a: A) => B>, fa: T.Task<A>): T.Task<B> =>
    () =>
      Promise.all([fab(), fa()]).then(([f, a]) => f(a)),
};

/**
 * Lifting
 *
 * liftA2 `(b: B) => (c: C) => D` to `(fb: F<B>) => (fc: F<C>) => F<D>`
 *
 */
type Curried2<B, C, D> = (b: B) => (c: C) => D;

function liftA2<F>(
  F: Apply<F>
): <B, C, D>(
  g: Curried2<B, C, D>
) => Curried2<HKT<F, B>, HKT<F, C>, HKT<F, D>> {
  return (g) => (fb) => (fc) => F.ap(F.map(fb, g), fc);
}

type Curried3<B, C, D, E> = (b: B) => (c: C) => (d: D) => E;

function liftA3<F>(
  F: Apply<F>
): <B, C, D, E>(
  g: Curried3<B, C, D, E>
) => Curried3<HKT<F, B>, HKT<F, C>, HKT<F, D>, HKT<F, E>> {
  return (g) => (fb) => (fc) => (fd) => F.ap(F.ap(F.map(fb, g), fc), fd);
}
