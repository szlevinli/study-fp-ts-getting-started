# Functor, Applicative, Monad

## The General Problem Solved

| f         | g            | composition      |
| --------- | ------------ | ---------------- |
| pure      | pure         | `g . f`          |
| effectful | pure (n-ary) | `liftAn(g) . f`  |
| effectful | effectful    | `flatMap(g) . f` |

## Definition

| Effect      | Function             | To                            | name    | method  |
| ----------- | -------------------- | ----------------------------- | ------- | ------- |
| Functor     | `A => B`             | `F<A> => F<B>`                | lift    | `map`   |
| Applicative | `A => B => C => ...` | `F<A> => F<B> => F<C> => ...` | unpack  | `ap`    |
| Monad       | `A => M<B>`          | `M<A> => M<B>`                | flatMap | `chain` |

### Functor

A functor is a pair `(F, lift)` where

- `F` is a `n`-ary type constructor (`n >= 1`) which maps each type `X` to the type `F<X>` (**mapping between objects**)
- `lift` is a function with the following signature

  ```ts
  const lift = <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>)
  ```

### Monad

A monad is defined by three things:

1. a type constructor `M` which admits a `Functor` instance.
2. a function `of` which the following signature.
3. a function `flatMap` with the following signature

   ```ts
   const of = <A>(a: A) => HKT<M, A>

   const flatMap: <A, B>(f: (a: A) => HKT<M, B>) => ((ma: HKT<M, A>) => HKT<M, B>)
   ```
