import { string as S, number as N } from 'fp-ts';
import { Semigroup } from 'fp-ts/Semigroup';
import { strict as assert } from 'node:assert';

const concatAll =
  <A>(M: Semigroup<A>) =>
  (startWith: A) =>
  (as: ReadonlyArray<A>): A =>
    as.length === 0
      ? startWith
      : as.reduce((pv, cv) => M.concat(pv, cv), startWith);

// ----------------------------------------------------------------------------
// test
// ----------------------------------------------------------------------------

assert.deepStrictEqual(concatAll(N.SemigroupSum)(0)([]), 0);
assert.deepStrictEqual(concatAll(N.SemigroupSum)(0)([1, 2, 3, 4]), 10);
assert.deepStrictEqual(concatAll(N.SemigroupProduct)(1)([1, 2, 3, 4]), 24);
assert.deepStrictEqual(concatAll(S.Semigroup)('a')(['b', 'c']), 'abc');

// ----------------------------------------------------------------------------
// solutions
// ----------------------------------------------------------------------------

const concatAll_S =
  <A>(M: Semigroup<A>) =>
  (startWith: A) =>
  (as: ReadonlyArray<A>): A =>
    as.reduce(M.concat, startWith);

assert.deepStrictEqual(concatAll_S(N.SemigroupSum)(0)([]), 0);
assert.deepStrictEqual(concatAll_S(N.SemigroupSum)(0)([1, 2, 3, 4]), 10);
assert.deepStrictEqual(concatAll_S(N.SemigroupProduct)(1)([1, 2, 3, 4]), 24);
assert.deepStrictEqual(concatAll_S(S.Semigroup)('a')(['b', 'c']), 'abc');
