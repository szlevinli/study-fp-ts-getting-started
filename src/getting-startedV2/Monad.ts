/**
 * Definition
 *
 * A monad is defined by three things:
 *
 * 1. a type constructor `M` which admits a `Functor` instance
 * 2. a function `of` with the following signature
 * 3. a function `flatMap` with the following signature
 *
 * ```ts
 * of: <A>(a: A) => HKT<M, A>
 *
 * flatMap: <A, B>(f: (a: A) => HKT<M, B>) => ((ma: HKT<M, A>) => HKT<M, B)
 * ```
 */
