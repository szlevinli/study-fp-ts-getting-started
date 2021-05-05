// Use case: an API that may fail and returns `undefined` or `null`
// Example: Array.prototype.find
// Solution: `Option`, `fromNullable`

import { Option, fromNullable } from 'fp-ts/Option';

export const find = <A>(predicate: (a: A) => boolean) => (xs: Array<A>) =>
  fromNullable(xs.find(predicate));
