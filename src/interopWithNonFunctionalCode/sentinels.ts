/* cspell:words codomain */

// Use case: an API that may fail and returns a special value of the codomain.
// Example: `Array.prototype.findIndex`
// Solution: `Option`

import { Option, none, some } from 'fp-ts/Option';
import { curry } from 'ramda';

export const findIndex = curry(
  <A>(predicate: (a: A) => boolean, xs: Array<A>): Option<number> => {
    const index = xs.findIndex(predicate);
    return index === -1 ? none : some(index);
  }
);
