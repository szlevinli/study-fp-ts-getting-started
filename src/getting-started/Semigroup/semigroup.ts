/**
 * Semigroup(半群)
 *
 * 是函数式编程最基本的抽象. 也就是说它及其重要.
 * 它是由两部分组成, 一部分是一个非空的类型 A, 另一部分是一个二元结合运算(binary associative operation)
 * 使用 `(A, *)` 来表示, 其中 `*` 就代表的是一个二元结合运算.
 * 二元运算的概念是: 一种基于两个元素的运算操作. 可表示为, `*: (x: A, y: A) => A`
 * 结合(associative)的概念是: 满足结合律. 可表示为: `(x * y) * z === x * (y * z)`
 *
 * 有大量的半群例子, 比如:
 * - `(number, *)`: `*` 是数字乘法的意思
 * - `(string , +)`: `+` 是字符连接的意思
 * - `(boolean, &&)`: `&&` 是逻辑与的意思
 *
 * *Type class defined:
 *
 * ```
 * interface Semigroup<A> {
 *   concat: (x: A, y: A) => A
 * }
 * ```
 *
 * *Law:
 * - Associativity: `concat(concat(x, y), z) === concat(x, concat(y, z))`, for
 *                  all `x`, `y`, `z` in `A`
 *
 * `concat` 是一个抽象的概念, 可以表示很多不同的运算, 比如:
 * - concatenation: 连接
 * - merging: 合并
 * - fusion: 融合
 * - selection: 选择
 * - addition: 加成
 * - substitution: 置换
 */

import * as SG from 'fp-ts/Semigroup';
import {
  number as N,
  function as F,
  boolean as B,
  option as O,
  apply as A,
} from 'fp-ts';

// *create instance from `Ord`
// 取最小值. (number)
export const min = SG.min(N.Ord);

// 取最大值. (number)
export const max = SG.max(N.Ord);

// *create instance with custom
export type Point = {
  x: number;
  y: number;
};

// with manual
export const semigroupPointM: SG.Semigroup<Point> = {
  concat: (p1, p2) => ({
    x: N.SemigroupSum.concat(p1.x, p2.x),
    y: N.SemigroupSum.concat(p1.y, p2.y),
  }),
};

// with API
export const semigroupPoint = SG.struct<Point>({
  x: N.SemigroupSum,
  y: N.SemigroupSum,
});

/**
 * *Semigroup 不但可以针对 primitive, object 还可以使用 function
 *
 * 下述代码的说明:
 * - `getSemigroup` 接收一个 Semigroup<boolean>, 返回一个新函数, 我们通过指定泛型
 *   `<Point>` 来调用这个函数, 最终返回 Semigroup<(a: Point) => boolean>.
 *   `getSemigroup` 函数的特点是接收一个 Semigroup<S> (注意这里的泛型 S 会约束后面的实现)
 *   然后在接收一个泛型 <A>, 最终返回一个 Semigroup<(a: A) => S>. 最终返回的 Semigroup
 *   的类型是一个函数, 且该函数满足 `(a: A) => S` 的要求.
 *
 *   总体来说 `getSemigroup` 就是用于生成一个类型是函数的 Semigroup
 */

const isPositiveX: F.Predicate<Point> = (p) => p.x >= 0;
const isPositiveY: F.Predicate<Point> = (p) => p.y >= 0;

const semigroupPredicate = F.getSemigroup(B.SemigroupAll)<Point>();

export const isPositivePoint = semigroupPredicate.concat(
  isPositiveX,
  isPositiveY
);

// concat 只能对两个类型`A`的元素进行运算, 使用 `concatAll` 可以实现对多个元素进行运算
export const sum = SG.concatAll(N.SemigroupSum)(0);
export const product = SG.concatAll(N.SemigroupProduct)(1);

// 应用 semigroup 到其他结构类型. 比如, 应用到 `Option` 中
export const S = A.getApplySemigroup(O.Apply)(N.SemigroupSum);
