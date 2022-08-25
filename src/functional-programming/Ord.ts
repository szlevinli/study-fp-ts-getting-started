import { ord, number as N } from 'fp-ts';
import * as assert from 'assert';

const fnClamp = ord.clamp(N.Ord)(10, 15);

// between
assert.deepStrictEqual(fnClamp(13), 13);
// low-bound
assert.deepStrictEqual(fnClamp(10), 10);
// up-bound
assert.deepStrictEqual(fnClamp(15), 15);
// 超出上边界
assert.deepStrictEqual(fnClamp(20), 15);
// 超出下边界
assert.deepStrictEqual(fnClamp(3), 10);
