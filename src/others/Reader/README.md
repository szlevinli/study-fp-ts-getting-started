# Reader

## 目的

`Reader` 是一个 `monad`, 他主要用于解决避免参数穿越多个函数, 其中被穿越的函数实际并不依赖这些参数. 这很像 `React` 中的 `Context` 概念.

这里还提出了一个想法是使用 `Reader` 单子进行依赖注入(**dependency injection**)

类型 `Reader<R, A>` 表示的是一个函数 `(r: R) => A`

```typescript
interface Reader<R, A> {
  (r: R): A;
}
```

- `R` 表示一个 `environment` 或 `dependency` 需要从中读取相关信息
- `A` 表示读取的结果类型

## Example

```typescript
const f = (b: boolean): string => (b ? 'true' : 'false')

const g = (n: number): string => f(n > 2)

const h = (s: string): string => g(s.length + 1)
```

如果需要为函数 `f` 增加国际化功能, 我们可以添加额外的参数

```typescript
interface Dependencies {
  i18n: {
    true: string
    false: string
  }
}

const f = (b: boolean, deps: Dependencies) =>
  b ? deps.i18n.true : deps.i18n.false;
```

因为对 `f` 函数增加了一个参数, 所以我们必须修改 `g` 函数, 同理也必须修改 `h` 函数

```typescript
const g = (n: number, deps: Dependencies) => f1(n > 2, deps);

const h = (s: string, deps: Dependencies) => g1(s.length + 1, deps);
```

从上面的代码我们可以看到, 对 `g` 和 `h` 的修改是被迫的, 它们本身并不使用第二个参数 `deps`, 仅仅只是透传.

我们可以将 `Dependencies` 从参数移到返回值中去, 从而优化上面的问题.

## `Reader`

`Reader` 就是落地实现上面所描述的优化方法(*"我们可以将 `Dependencies` 从参数移到返回值中去"*)的解决方案

```typescript
import { Reader } from 'fp-ts/lib/Reader'

const f =
  (b: boolean): Reader<Dependencies, string> =>
  (deps) =>
    b ? deps.i18n.true : deps.i18n.false;

const g = (n: number): Reader<Dependencies, string> => f(n > 2);

export const h = (s: string): Reader<Dependencies, string> => g(s.length + 1);
```

> **Note:** 这里的 `Reader<Dependencies, string>` 类型实际是一个函数, 其签名为 `(r: Dependencies) => string`

## `ask`

`Reader` 的强大之处在于当我们扩展依赖, 它可以很优雅的通过函数组合的方式来解决.

比如我们扩展 `Dependencies` 增加一个 `lowerBound` 属性, 该属性由函数 `g` 使用

```typescript
export interface Dependencies {
  i18n: {
    true: string
    false: string
  }
  lowerBound: number
}

const instance: Dependencies = {
  i18n: {
    true: '真',
    false: '假'
  },
  lowerBound: 2
}
```

现在我们可以使用 `ask` 读取 `lowerBound`

```typescript
import { pipe } from 'fp-ts/function'
import { ask, chain, Reader } from 'fp-ts/Reader'

const g = (n: number): Reader<Dependencies, string> =>
  pipe(
    ask<Dependencies>(),
    chain(deps => f(n > deps.lowerBound))
  )
```

下面的代码都是实现一样的功能

```typescript
const g = (n: number) => (deps: Dependencies) => pipe(deps, f(n > deps.lowerBound))

const g = (n: number): Reader<Dependencies, string> => deps => pipe(deps, f(n > deps.lowerBound))

const g = (n: number): Reader<Dependencies, string> => deps => f(n > deps.lowerBound)(deps)

const g = (n: number): Reader<Dependencies, string> =>
  pipe(
    ask<Dependencies>(),
    chain(deps => f(n > deps.lowerBound))
  )
```
