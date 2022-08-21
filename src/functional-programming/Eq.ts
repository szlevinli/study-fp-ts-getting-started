import { number as N } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { Eq } from 'fp-ts/Eq';
import { strict as assert } from 'node:assert';
import { Semigroup } from 'fp-ts/lib/Semigroup';

/*
Example:

Let's see the first example of the usage of the `Eq` abstraction by defining
a function `elem` that checks whether a given value is an element of
`ReadonlyArray`
*/

const elem =
  <A>(E: Eq<A>) =>
  (a: A) =>
  (as: ReadonlyArray<A>): boolean =>
    as.some((e) => E.equals(a, e));

assert.strictEqual(pipe([1, 2, 3], elem(N.Eq)(2)), true);
assert.strictEqual(pipe([1, 2, 3], elem(N.Eq)(4)), false);

/*
Why would we not use the native `includes` Array method?
*/

assert.strictEqual([1, 2, 3].includes(2), true);
assert.strictEqual([1, 2, 3].includes(4), false);

/*
Let's define some `Eq` instance for more complex types.
*/

type Point = {
  readonly x: number;
  readonly y: number;
};

const EqPoint: Eq<Point> = {
  equals: (first, second) => first.x === second.x && first.y === second.y,
};

assert.strictEqual(EqPoint.equals({ x: 1, y: 2 }, { x: 1, y: 2 }), true);
assert.strictEqual(EqPoint.equals({ x: 1, y: 2 }, { x: 1, y: -2 }), false);

/*
and check the result of `elem` and `includes`
*/

const points: ReadonlyArray<Point> = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 2 },
];

const search: Point = { x: 1, y: 1 };

assert.strictEqual(points.includes(search), false); // => false ❌
assert.strictEqual(elem(EqPoint)(search)(points), true);

/*
Quiz: Given a data type `A`, is it possible to define a
`Semigroup<Eq<A>>`? What could it represent?
*/

const x = <A>(): Semigroup<Eq<A>> => ({
  concat: (x, y) => ({
    equals: (xx, yy) => x.equals(xx, yy) && y.equals(xx, yy),
  }),
});

const x1 = x<number>();

const r_x1 = x1.concat(N.Eq, N.Eq).equals(1, 1);

assert.strictEqual(r_x1, true);
