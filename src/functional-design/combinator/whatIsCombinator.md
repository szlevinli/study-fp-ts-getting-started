# What is combinator?

Combinator refers to the [combinator pattern](https://wiki.haskell.org/Combinator)

> A style of organizing libraries centered around the idea of combining things. Usually there is some type `T`, some "primitive" values of type `T`, and some "combinator" which can combine values of type `T` in various ways to build up more complex values of type `T`.

General shape of a combinator is

```js
combinator: Thing -> Thing
```

Combinator 的模式是它需要保证返回的类型 `T` 保持不变, 改变的仅仅是类型 `T` 中的 '值'. 比如我们将类型为 `Array` 值为 `number` 的数据通过 combinator 将 `number` 变为 `boolean`, `string` 甚至是 `Array<number>`.

上述的模式保证了 combinator 后的数据保持原有类型, 从而可以再次进行其他的 combinator, 直至满足需求, 这也是 combinator 这个词的含义.
