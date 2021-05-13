# What is combinator?

Combinator refers to the [combinator pattern](https://wiki.haskell.org/Combinator)

> A style of organizing libraries centered around the idea of combining things. Usually there is some type `T`, some "primitive" values of type `T`, and some "combinator" which can combine values of type `T` in various ways to build up more complex values of type `T`.

General shape of a combinator is

```js
combinator: Thing -> Thing
```

Combinator 的模式是在保证返回类型 `T` 不变的情况下, 改变类型 `T` 中的 '值'. 比如我们将类型为 `Array` 的值设定为 `number`, 则通过某些 combinator 可以将 `number` 变为 `boolean`, `string` 甚至是 `Array<number>`.

上述的模式保证了 combinator 后的数据保持原有类型, 从而可以再次进行其他的 combinator, 直至满足需求, 这也是 combinator 这个词的含义.

来看看下面的列子.

## Example 1: `Eq`

创建 `getEq` combinator: 给定一个 `Eq<A>`, 将其转换为 `Eq<ReadonlyArray<A>>`.

```ts
import { Eq, fromEquals } from 'fp-ts/Eq';

export const getEq = <A>(E: Eq<A>): Eq<ReadonlyArray<A>> =>
  fromEquals(
    (xs, ys) =>
      xs.length === ys.length && xs.every((x, i) => E.equals(x, ys[i]))
  );
```

使用 `getEq` 为 `Eq<number>` 创建 `Eq<ReadonlyArray<number>>` 用于检测 '数字数组' 的相等

```ts
import { Eq as eqNumber } from 'fp-ts/number';

export const eqNumbers = getEq(eqNumber);

expect(eqNumbers.equals([1, 2, 3], [1, 2, 3])).toBeTruthy();
```

创建 `contramap` combinator: 给定一个 `Eq<A>` 和 一个 函数 `(b: B) => A`, 来创建一个 `Eq<B>`.

```ts
export const contramap: <A, B>(f: (b: B) => A) => (E: Eq<A>) => Eq<B> =
  (f) => (E) =>
    fromEquals((x, y) => E.equals(f(x), f(y)));
```

使用 `contramap` 为 `Eq<boolean>` 创建 `Eq<number>` 用于检测两个数字是否同时在阈值的一边.

```ts
const eq = contramap<boolean, number>((x) => x >= 10)(eqBoolean);

expect(eq.equals(11, 12)).toBeTruthy(); // 都比 10 大
expect(eq.equals(9, 12)).toBeFalsy(); // 一个比 10 大 一个比 10 小
expect(eq.equals(5, 6)).toBeTruthy(); // 都比 10 小
```

关于 `contramap` 这个词, 它是由两个单词组成的 `contra` + `map`, 翻译过来是 '反向映射' 的意思. `map` 操作时需要 `(a: A) => B` 函数, 从而可以计算出 `E<B>`, 而现在只知道 `(b: B) => A` 函数, 刚好和 `map` 需要的函数*<u>输入</u>*和*<u>输出</u>*反过来, 因此称之为 '反向映射'.

> `contramap` 函数是 `fp-ts/Eq` 内建函数, 可以通过如下方式引入

```ts
import { contramap } from 'fp-ts/Eq';
```

使用 `contramap` 可以很方便的创建自定义类型的比较操作, 如下:

```ts
type User = {
  id: number;
  name: string;
};

const eqUser: Eq<User> = pipe(
  eqNumber,
  contramap((user: User) => user.id)
);

const user1 = { id: 1, name: 'levin' };
const user2 = { id: 1, name: 'jack' };
const user3 = { id: 3, name: 'emma' };

expect(eqUser.equals(user1, user2)).toBeTruthy();
expect(eqUser.equals(user1, user3)).toBeFalsy();
```

## Example 2: ``
