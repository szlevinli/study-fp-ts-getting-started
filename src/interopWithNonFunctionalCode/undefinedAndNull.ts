// Use case: an API that may fail and returns `undefined` or `null`
// Example: Array.prototype.find
// Solution: `Option`, `fromNullable`

import { Option, fromNullable } from 'fp-ts/Option';
import { curry, curryN } from 'ramda';

export const find = curry(
  <A>(predicate: (a: A) => boolean, xs: Array<A>): Option<A> =>
    fromNullable(xs.find(predicate))
);
