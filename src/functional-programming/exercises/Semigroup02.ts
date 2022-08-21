import { Predicate, and } from 'fp-ts/Predicate';
import { Semigroup } from 'fp-ts/Semigroup';
import { strict as assert } from 'node:assert';

type Point = {
  readonly x: number;
  readonly y: number;
};

const isPositiveX: Predicate<Point> = (p) => p.x >= 0;
const isPositiveY: Predicate<Point> = (p) => p.y >= 0;

const S: Semigroup<Predicate<Point>> = {
  concat: (first, second) => (p) => first(p) && second(p),
};

const S2: Semigroup<Predicate<Point>> = {
  concat: (first, second) => and(second)(first),
};

// ----------------------------------------------------------------------------
// test
// ----------------------------------------------------------------------------

const isPositiveXY = S.concat(isPositiveX, isPositiveY);
const isPositiveXY2 = S2.concat(isPositiveX, isPositiveY);

assert.deepStrictEqual(isPositiveXY({ x: 1, y: 1 }), true);
assert.deepStrictEqual(isPositiveXY({ x: 1, y: -1 }), false);
assert.deepStrictEqual(isPositiveXY({ x: -1, y: 1 }), false);
assert.deepStrictEqual(isPositiveXY({ x: -1, y: -1 }), false);

assert.deepStrictEqual(isPositiveXY2({ x: 1, y: 1 }), true);
assert.deepStrictEqual(isPositiveXY2({ x: 1, y: -1 }), false);
assert.deepStrictEqual(isPositiveXY2({ x: -1, y: 1 }), false);
assert.deepStrictEqual(isPositiveXY2({ x: -1, y: -1 }), false);

// ----------------------------------------------------------------------------
// solutions
// ----------------------------------------------------------------------------

import { getSemigroup } from 'fp-ts/function';
import { boolean as Bln } from 'fp-ts';

const S_C: Semigroup<Predicate<Point>> = getSemigroup(
  Bln.SemigroupAll
)<Point>();

const isPositiveXY_C = S_C.concat(isPositiveX, isPositiveY);

assert.deepStrictEqual(isPositiveXY_C({ x: 1, y: 1 }), true);
assert.deepStrictEqual(isPositiveXY_C({ x: 1, y: -1 }), false);
assert.deepStrictEqual(isPositiveXY_C({ x: -1, y: 1 }), false);
assert.deepStrictEqual(isPositiveXY_C({ x: -1, y: -1 }), false);
