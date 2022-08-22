import { strict as assert } from 'node:assert';
import { Eq } from 'fp-ts/Eq';
import { number as N } from 'fp-ts';

const getEq = <A>(E: Eq<A>): Eq<ReadonlyArray<A>> => ({
  equals: (x, y) =>
    x.length == y.length && x.every((v, i) => E.equals(v, y[i])),
});

// ----------------------------------------------------------------------------
// test
// ----------------------------------------------------------------------------

const E = getEq(N.Eq);

const as: ReadonlyArray<number> = [1, 2, 3];

assert.deepStrictEqual(E.equals(as, [1]), false);
assert.deepStrictEqual(E.equals(as, [1, 2]), false);
assert.deepStrictEqual(E.equals(as, [1, 2, 4]), false);
assert.deepStrictEqual(E.equals(as, [1, 2, 3, 4]), false);
assert.deepStrictEqual(E.equals(as, [1, 2, 3]), true);
