/* cspell:words struct contramap */

import { number as N, eq as Eq, array as Array } from 'fp-ts';

// `Eq` type class 的目的是为了实现相等比较操作
// 实现了 `equals` 函数的结构体即为一个 type class `Eq`
// 在 `fp-ts` 中有很多 `module` 均实现了 `Eq` 接口
// 比如: Date boolean number string...

// ```
// interface Eq<A> {
//   readonly equals: (x: A, y: A) => boolean
// }
// ```

// Laws:
// - Reflexivity(自反性): `equals(x, x) === true`, for all `x` in `A`
// - Symmetry(对称性): `equals(x, y) === equals(y, x)`, for all `x`, `y` in `A`
// - Transitivity(传递性): if `equals(x, y) === true` and `equals(y, z) === true`,
//                         then `equals(x, z) === true`, for all `x`, `y`, `z` in `A`

// `fp-ts` 提供的 `Eq` 用于创建 `Eq` instance, 以及操作实现了 `Eq` 接口的结构
// 下面的例子使用 `Eq.struct` 创建 `Eq` instance

export type Point = {
  x: number;
  y: number;
};

// `eqPoint` 是一个对象, 拥有一个 `equals` 方法
// { equals: [Function: equals] }
export const eqPoint: Eq.Eq<Point> = Eq.struct({
  x: N.Eq,
  y: N.Eq,
});

export type Vector = {
  from: Point;
  to: Point;
};

export const eqVector: Eq.Eq<Vector> = Eq.struct({
  from: eqPoint,
  to: eqPoint,
});

// 使用 `Array.getEq` 创建 `Eq` instance
export const eqArrayOfPoints: Eq.Eq<Array<Point>> = Array.getEq(eqPoint);

// 使用 `Eq.contramap` 创建 `Eq` instance
// 这个列子用于实现对于某些对象的比较, 只需要比较其中的某些字段即可
// 下面这个例子的场景: 当对比 User 是否相等时, 依靠的是其 userId 字段比较
export type User = {
  userId: number;
  name: string;
};

export const eqUser: Eq.Eq<User> = Eq.contramap((user: User) => user.userId)(
  N.Eq
);
