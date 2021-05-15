// declare function jonk<A, B>(
//   ab: (a: A) => B,
//   ann: (an: (a: A) => number) => number
// ): (bn: (b: B) => number) => number;

declare function _<T>(): T;

function jonk<A, B>(
  ab: (a: A) => B,
  ann: (an: (a: A) => number) => number
): (bn: (b: B) => number) => number {
  return (bn) => ann((a) => bn(ab(a)));
}

import { foldLeft } from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';

function zoop<A, B>(abb: (a: A) => (b: B) => B, b: B, as: Array<A>): B {
  return pipe(
    as,
    foldLeft(
      () => b,
      (head, tail) => abb(head)(zoop(abb, b, tail))
    )
  );
}
