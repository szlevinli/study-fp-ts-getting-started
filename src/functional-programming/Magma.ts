import { magma } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { strict as assert } from 'node:assert';

const magmaSub: magma.Magma<number> = {
  concat: (x, y) => x - y,
};

// helper
const getPipeConcat =
  <A>(MA: magma.Magma<A>) =>
  (y: A) =>
  (x: A) =>
    MA.concat(x, y);

const concat = getPipeConcat(magmaSub);

// Usage
assert.strictEqual(pipe(10, concat(2), concat(2)).valueOf(), 6);
