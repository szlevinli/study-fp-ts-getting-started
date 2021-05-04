/* cspell:words codomain */

// Use case: an API that may fail and returns a special value of the codomain.
// Example: `Array.prototype.findIndex`
// Solution: `Option`

import { Option, none, some } from 'fp-ts/Option';

export const findIndex = <A>(
  xs: Array<A>,
  predicate: (a: A) => boolean
): Option<number> => {
  const index = xs.findIndex(predicate);
  return index === -1 ? none : some(index);
};
