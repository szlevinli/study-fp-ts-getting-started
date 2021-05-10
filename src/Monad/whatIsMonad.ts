/**
 * *Why
 *
 * Monad 的目的: 解决两个 effected program 的 composition 问题.
 * ```
 * f: (a: A) => M<B>
 * g: (b: B) => M<C>
 * ```
 * How to composition `f` and `g`
 *
 * 推导过程用画图的方式最好理解, 详见 [fp-ts-Monad](https://dev.to/gcanti/getting-started-with-fp-ts-monad-6k)
 *
 * 最终的结果是
 * ```
 * h: flattenMap(g) ∘ f
 * ```
 */

/**
 * *Defined
 *
 * 1. A type constructor `M` which admits a `Functor` instance
 * 2. A function `of` with the following signature
 * ```
 * of: <A>(a: A) => HKT<M, A>
 * ```
 * 3. A function `flatMap` with the follow signature
 * ```
 * flatMap: <A, B>(f: (a: A) => HKT<M, B>) => (ma: HKT<M, A>) => HKT<M, B>
 * ```
 */

/**
 * *Monads in `fp-ts`
 *
 * ```
 * flatMap: <A, B>(f: (a: A) => HKT<M, B>) => (ma: HKT<M, A>) => HKT<M, B>
 * chain:   <A, B>(ma: HKT<M, A>, f: (a: A) => HKT<M, B>) => HKT<M, B>
 * ```
 */
