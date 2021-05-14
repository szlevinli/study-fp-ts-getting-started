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

## Example 2: `Monoid`

创建 `getMonoid` combinator: 给定 `Monoid<A>`, 将其转换为 `Monoid<IO<A>>`.

```ts
export const getMonoid = <A>(M: Monoid<A>): Monoid<IO<A>> =>
  getApplicativeMonoid(ioApplicative)(M);
```

> `getMonoid` 可以使用 `fp-ts/Applicative` 内建函数 `getApplicativeMonoid` 代替.

使用 `getMonoid` 创建 `replicateIO` combinator: 给定数字 `n` 和一个动作 `mv: IO<void>`, 实现执行 `n` 次 `mv` 的效果.

```ts
export const replicateIO =
  (n: number) =>
  (mv: IO<void>): IO<void> =>
    concatAll(getMonoid(monoidVoid))(replicate(n, mv));
```

- `replicate` 返回一个数组, 类型为 `readonly IO<void>[]`
- `concatAll` 使用 `getMonoid(monoidVoid)` 返回的 `Monoid<IO<void>>` 将 `readonly IO<void>[]` 中的 `item: IO<void>` 合并成一个 `IO<void>`.

下面我们使用 `replicateIO` 实现随机打印菲波那切数列. 首先我们封装 `console.log` 到 `IO` 中

```ts
export const log =
  (msg: unknown): IO<void> =>
  () =>
    console.log(String(msg));
```

接着创建一个菲波那切数列生成器, 请注意该函数使用了 curry 化以及 '尾递归' 优化

```ts
// curry
const fibonacci_ =
  (ac1: number) =>
  (ac2: number) =>
  (n: number): number =>
    n <= 1 ? ac2 : fibonacci_(ac2)(ac1 + ac2)(n - 1);

export const fibonacci = fibonacci_(1)(1);
```

最后实现随机打印函数

```ts
export const printFib: IO<void> = pipe(
  randomInt(30, 35),
  ioChain((n) => log(fibonacci(n)))
);
```

- `randomInt`: 随机生成 `IO<number>`
- `ioChain`: 返回 `IO<number>`. 使用 `chain` 即 `Apply` 接口的目的是, `ioChain` 函数接收的第一个参数是函数 `(n) => log(fibonacci(n))` 并返回 `IO<void>`, 第二个参数是 `IO<number>`, 因此需要使用 `chain` 的功能进行 `flatMap` 操作.

应用上面的函数, 实现随机打印菲波那切数列 `n` 次. (这里的 `n` 被设定为 3 次)

```ts
pipe(printFib, pipe( 3, replicateIO))();
```

> 突然想到 `combinator` 和 `map` 的作用仿佛是一样的, 主要区别在于 `combinator` 没有 `(a: A) => B` 函数.
