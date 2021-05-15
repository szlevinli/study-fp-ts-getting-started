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
- `ioChain`: 返回 `IO<number>`. 使用 `chain` 即 `Monad` 接口的目的是, `ioChain` 函数接收的第一个参数是函数 `(n) => log(fibonacci(n))` 并返回 `IO<void>`, 第二个参数是 `IO<number>`, 因此需要使用 `chain` 的功能进行 `flatMap` 操作.

应用上面的函数, 实现随机打印菲波那切数列 `n` 次. (这里的 `n` 被设定为 3 次)

```ts
replicateIO(3)(printFib);
/*
1346269
9227465
3524578
*/
```

> 突然想到 `combinator` 和 `map` 的作用仿佛是一样的, 主要区别在于 `combinator` 没有 `(a: A) => B` 函数.

## Example 3: `IO`

创建一个函数模拟实现类似 Unix 系统上的命令, 即在控制台打印出执行某项任务/工作/程序所消耗的时间.

下面的这个方法实现极具 functional programming 风格, 那就是组合, 组合, 还是组合.

```ts
export const time = <A>(ma: IO<A>): IO<A> =>
  Monad.chain(now, (start) =>
    Monad.chain(ma, (a) =>
      Monad.chain(now, (end) =>
        Monad.map(ioLog(`Elapsed: ${end - start}`), () => a)
      )
    )
  );
```

首先我们先看一下 `Monad.chain` 的签名:

```ts
chain: <A, B>(fa: F<A>, f: (a: A) => F<B>) => F<B>
```

> - 上面的代码进行了简化为了更容易理解, 其中 `F` 表示的是类型泛型.
> - `F<A>` 可以理解为拥有 `A` 类型值的结构体 `F`. 比如 `F` 是结构体 `IO`, `A` 的类型是 `number`, 表示为 `IO<number>`

- `Monad.chain(now, (start) =>` 其中的 `now` 是 `IO<number>` 类型, 所以 `start` 肯定也是必须是 `number`
- `Monad.chain(ma, (a) =>` 其中的 `ma` 是我们需要执行的动作, 也就是被测量耗时多少的目标, 它的类型是 `IO<void>`, 所以 `a` 的类型是 `void`
- `Monad.chain(now, (end) =>` 参见上面 `Monad.chain(now, (start) =>` 的说明
- `Monad.map(ioLog(`Elapsed: ${end - start}`), () => a)` 其中 `map` 函数接收的第一个参数的类型是 `IO<void>`, 第二个参数是函数, 这个函数接收一个 `void` 类型的参数, 其实这个函数在整个流程中并无用途, 仅仅是为了满足调用规范.

调用方法

```ts
time(replicateIO(3)(printFib))();
/*
5702887
1346269
14930352
Elapsed: 193
*/
```

如果我们还想知道单次执行的时间, 可以这样:

```ts
time(replicateIO(3)(time(printFib)))();
/*
3524578
Elapsed: 32
14930352
Elapsed: 125
3524578
Elapsed: 32
Elapsed: 189
*/
```

## General `time`

上面的 `time` 函数有如下问题

- 不够灵活. 比如使用者无法选择使用 elapsed 干些别的什么事
- 只能使用 `IO` 结构体

首先解决第一个问题, 即不够灵活的问题. 改写 `time` 函数, 将 elapsed 值当做输出返回给使用者, 这样他们就可以使用该值做他们想做的事情了.

```ts
export const time = <A>(ma: IO<A>): IO<[A, number]> =>
  Monad.chain(now, (start) =>
    Monad.chain(ma, (a) => Monad.map(now, (end) => [a, end - start]))
  );
```

接着我们就可以使用新的 `time` 函数结合 `log` 函数来实现最早的 `time` 函数功能, 我们吧这个新函数命名为 `withLogging`

```ts
export const withLogging = <A>(ma: IO<A>): IO<A> =>
  Monad.chain(time(ma), ([a, milliseconds]) =>
    Monad.map(log(`Result: ${a}, Elapsed: ${milliseconds}`), () => a)
  );
```

同时我们发现, 新的 `time` 函数返回的是一个 tuple 结构分别放置的是 [动作执行结果, 消耗的时间], 但有时候我们可能不需要 '消耗的时间', 仅需要 '动作执行结果', 那么我们可以定义如下函数

```ts
export const ignoreTime = <A>(ma: IO<[A, unknown]>): IO<A> =>
  Monad.map(ma, ([a]) => a);
```

最后为了体会一下将 `time` 函数更泛化后的强大, 我们来编写一个函数, 该函数可以返回执行速度最快的 '动作'(action)

```ts
export const fastest = <A>(head: IO<A>, tail: Array<IO<A>>): IO<A> => {
  const ordTuple = contramap(([_, elapsed]: [A, number]) => elapsed)(ordNumber);
  const semigroupTuple = min(ordTuple);
  const semigroupIO = getApplySemigroup(applyIO)(semigroupTuple);
  const fastest = concatAll(semigroupIO)(time(head))(tail.map(time));
  return ignoreTime(fastest);
};
```

上面这段代码还是有点难度的, 我们先把思路理顺

- "返回执行速度最快的 '动作'(action)" 少不了比大小, 且比的是数字大小, 因此我们需要引入 `Ord<number>`
- 既然有比较, 肯定就有比较的对象, 且这些对象是任意多的, 我们可以使用数组的方式来组织这些对象, 最后要从中选择一个最快的出来, 这就涉及多变一, 需要引入类似 `fold` 的功能, 这里使用 `concatAll` 方法来实现

下面我们一步一步的来看代码

- `ordTuple` 使用反向映射(`contramap`)将 `Ord<number>` 映射成 `Ord<[A, number]>`. 该函数 `ordTuple` 的作用是, 使用 tuple 中第二个元素作为整个 tuple 的大小比较.
- `semigroupTuple` 使用 `Semigroup` 结构体的 `min` 函数创建 `Semigroup<[A, number]>`. `min` 函数的参数只有一个, 类型为 `Ord` 的结构体, 放到这里是 `Ord<[A, number]>`. 该函数 `semigroupTuple` 作用是, 从比较的对象中, 返回小的那个.
- `semigroupIO` 使用 `getApplySemigroup` 函数将 `Semigroup<[A, number]>` lift 成 `Semigroup<IO<[A, number]>>`
- `fastest` 获取运行时间最短的动作. 使用 `semigroupIO` 进行大小判断, `time(head)` 作为第一个比较对象, 与 `tail.map(time)` 返回的对象比较, 取运行时间短的, 然后与下一个对象比较, 直至所有对象比对完成, 返回 `IO<[A, number]>`.
- `ignoreTime` 提取 tuple 中的 `A`

我们来执行看看效果

```ts
const fib = (n: number): number => (n <= 1 ? 1 : fib(n - 1) + fib(n - 2));

const program = withLogging(Monad.map(randomInt(30, 35), fib));

const fastestProgram = Monad.chain(fastest(program, [program, program]), (a) =>
  log(`Fastest result is: ${a}`)
);

fastestProgram();

/*
Result: 5702887, Elapsed: 34
Result: 1346269, Elapsed: 8
Result: 9227465, Elapsed: 55
Fastest result is: 1346269
*/
```