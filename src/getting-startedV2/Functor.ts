import { option, task, functor } from 'fp-ts';

/* 
Lift `(b: B) => C` to `(fb: F<B>) => F<C>`
*/

// Lift `g` to `Array`
function liftArray<B, C>(g: (b: B) => C): (fb: Array<B>) => Array<C> {
  return (fb) => fb.map(g);
}

// Lift `g` to `Option`
function liftOption<B, C>(
  g: (b: B) => C
): (fb: option.Option<B>) => option.Option<C> {
  return (fb) => (option.isSome(fb) ? option.some(g(fb.value)) : option.none);
}

// Lift `g` to `Task`
function liftTask<B, C>(g: (b: B) => C): (fb: task.Task<B>) => task.Task<C> {
  return (fb) => () => fb().then(g);
}

/*
Definition

A functor is a pair `(F, lift)` where

- `F` is a `n`-ary type constructor (`n >= 1`). **Mapping between objects**
- `lift` is a function with the following signature

```ts
lift: <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>)
```

which map each function `f: (a: A) => B` to
a function `lift(f): (fa: F<A>) => F<B>`. **Mapping between morphisms**

The `lift` function is also known through a variant called `map`,
which is basically `lift` with the arguments rearranged

```ts
lift: <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>)
map:  <A, B>(fa: F<A>, f: (a: A) => B) => F<B>
```
*/
