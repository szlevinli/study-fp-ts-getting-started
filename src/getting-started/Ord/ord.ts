import { ord as Ord } from 'fp-ts';

// `Ord` type class 的目的是为了实现比较大小操作
// 需要继承 `Eq` 接口, 正所谓没有比较相等就没有比较大小
// 需实现 `compare` 函数的结构体即为一个 type class `Ord`

// ```
// type Ordering = -1 | 0 | 1;
//
// interface Ord<A> extends Eq<A> {
//   readonly compare: (x: A, y: A) => Ordering
// }
// ```

// Laws:
// - Reflexivity(自反性): `compare(x, x) === 0`, for all `x` in `A`
// - AntiSymmetry(反向对称性): `compare(x, y) <= 0` and `compare(y, x) <= 0`,
//                         then `x === y`, for all `x`, `y` in `A`
// - Transitivity(传递性): if `compare(x, y) <= 0` and `compare(y, z) <= 0`,
//                         then `compare(x, z) <= 0`, for all `x`, `y`, `z` in `A`

// create instance with `fromCompare`
// 我们直接使用一个 compare 函数来创建了 Ord, 该方法隐含的创建了 Eq, 因为
// `equals: (x, y) => compare(x, y) === 0`
export const ordNumber = Ord.fromCompare((x: number, y: number) =>
  x < y ? -1 : x > y ? 1 : 0
);

export type User = {
  name: string;
  age: number;
};
export const ordUser = Ord.fromCompare((x: User, y: User) =>
  x.age < y.age ? -1 : x.age > y.age ? 1 : 0
);

// create instance with `contramap`
export const byAge = Ord.contramap((b: User) => b.age)(ordNumber);

export const byAgeDesc = Ord.reverse(byAge);
