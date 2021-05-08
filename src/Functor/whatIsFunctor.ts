import { option as O, task as T, functor as FT } from 'fp-ts';

/**
 * 函数式编程的核心问题是函数的组合 function composition
 * 对于下面的两个泛型函数该如何组合, 就是函数式编程核心需要处理的问题
 * ```
 * f: (a: A) => B
 * g: (c: C) => D
 * ```
 * f 和 g 组合的要求是 B === C, 如果 B !== C 呢?
 * 这就是本章所要处理的问题.
 *
 * *pure program signature: `(a: A) => B`
 *
 * *effected program signature: `(a: A) => F<B>`
 *
 * 当我们需要处理 pure program 和 effected program 的组合, 需要对 pure program
 * 进行 lift, 从 `(a: A) => B` 变为: `(a: F<A>) => F<B>`
 *
 * `F` 表示的是 type constructor
 */

//===== lift ====

// lift for Array
// liftArray 实际实现的是将 g 函数, lift 成 fb 函数
// `(b: B) => C` 变成 `(b: Array<B>) => Array<C>`
export const liftArray = <B, C>(
  g: (b: B) => C
): ((fb: Array<B>) => Array<C>) => (fb) => fb.map(g);

// lift for Option
export const liftOption = <B, C>(
  g: (b: B) => C
): ((fb: O.Option<B>) => O.Option<C>) => (fb) =>
  O.isNone(fb) ? O.none : O.some(g(fb.value));

// lift for Task
export const liftTask = <B, C>(
  g: (b: B) => C
): ((fb: T.Task<B>) => T.Task<C>) => (fb) => () => fb().then(g);

/**
 * 上面的 lift* 函数看起来几乎是一样的, 这并不是偶然, 他们的底层均遵循同一个函数范式(functional pattern)
 *
 * 其实所有这些 type constructors (eg. Array, Option, Task) 均接纳(admit) 一个 functor instance.
 */

/**
 * !Categories 范畴
 *
 * *范畴由一对 `(Objects, Morphisms)` 组成
 *    设 `A` 和 `B` 是某一 Objects 中的对象, 则 `f: A ⟼ B` 读作 f 是 A 到 B 的一个态射
 * *范畴中的 Objects 和 Morphisms 遵循如下原则
 *    - composition of morphisms: 如果有 `f: A ⟼ B` 和 `g: B ⟼ C`, 则一定存在 `h = g ∘ f` 即 `h: A ⟼ C`
 *    - associativity: 如果 `f: A ⟼ B`, `g: B ⟼ C` 和 `h: C ⟼ D`, 则 `h ∘ (g ∘ f) = (h ∘ g) ∘ f`
 *    - identity: 对于每个对象 `X`, 一定存在一个态射 `identity: X ⟼ X`,
 *                同时对于 `f: A ⟼ X` 和 `g: X ⟼ B`, 都存在 `identity ∘ f = ` 和 `g ∘ identity = g`
 */

/**
 * !Functor 函子
 *
 * *函子是两个范畴间的映射. 因为范畴是由两部分组成的(objects and morphisms), 因此函子也由两部分组成
 *    - mapping between objects
 *    - mapping between morphisms
 *
 * *函子的正式定义: 一个函子是一对 (F, lift):
 *    - `F` 是一个 n-ary 的 type constructor (n >= 1), 用于将每个 `X` 映射到 `F<X>`(mapping between objects)
 *    - `lift` 是一个函数, 具有如下签名:
 *      `lift: <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>)` (mapping between morphisms)
 *
 * `lift` 函数通过一个变体, 称之为 `map` 函数, 其实就是重新排列了 `lift` 的参数排列
 *
 * ```
 * lift: <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>)
 * map:  <A, B>(f: (a: A) => B, fa: F<A>) => F<B>)
 * ```
 */

// create instance for Functor
// Note: `Response` 非常适合去创建一个函子, 因为其 type constructors 有一个参数 <A>
export interface Response<A> {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: A;
}

export const URI = 'Response';
export type URI = typeof URI;

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Response<A>;
  }
}

export const map = <A, B>(fa: Response<A>, f: (a: A) => B): Response<B> => ({
  ...fa,
  body: f(fa.body),
});

export const functorResponse: FT.Functor1<URI> = {
  URI,
  map,
};
