import { semigroup as Se, applicative as Ap } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import * as __NONE__ from './HKT';

interface Left<E> {
  readonly _tag: 'Left';
  readonly left: E;
}

interface Right<A> {
  readonly _tag: 'Right';
  readonly right: A;
}

type Either<E, A> = Left<E> | Right<A>;

const URI = 'Either';

type URI = typeof URI;

declare module './HKT' {
  interface UIRtoKind2<E, A> {
    readonly [URI]: Either<E, A>;
  }
}

const _ = {
  isLeft: <E>(ma: Either<E, unknown>): ma is Left<E> => ma._tag === 'Left',
  isRight: <A>(ma: Either<unknown, A>): ma is Right<A> => ma._tag === 'Right',
  left: <E, A = never>(e: E): Either<E, A> => ({ _tag: 'Left', left: e }),
  right: <A, E = never>(a: A): Either<E, A> => ({ _tag: 'Right', right: a }),
};

// const isLeft = <E>(ma: Either<E, unknown>): ma is Left<E> => ma._tag === 'Left';
const isLeft: <E>(ma: Either<E, unknown>) => ma is Left<E> = _.isLeft;

const isRight: <A>(ma: Either<unknown, A>) => ma is Right<A> = _.isRight;

const right: <A, E = never>(a: A) => Either<E, A> = _.right;

const left: <E, A = never>(e: E) => Either<E, A> = _.left;

const map: <A, B>(f: (a: A) => B) => <E>(fa: Either<E, A>) => Either<E, B> =
  (f) => (fa) =>
    isLeft(fa) ? fa : right(f(fa.right));

const map_ = <A, B, E>(fa: Either<E, A>, f: (a: A) => B): Either<E, B> =>
  pipe(fa, map(f));

const of: <E = never, A = never>(a: A) => Either<E, A> = right;

const getApplicativeValidation = <E>(
  SE: Se.Semigroup<E>
): Ap.Applicative2C<URI, E> => ({
  URI,
  _E: undefined as any,
  map: map_,
  of,
  ap: (fab, fa) =>
    isLeft(fab)
      ? isLeft(fa)
        ? left(SE.concat(fab.left, fa.left))
        : fab
      : isLeft(fa)
      ? fa
      : right(fab.right(fa.right)),
});
