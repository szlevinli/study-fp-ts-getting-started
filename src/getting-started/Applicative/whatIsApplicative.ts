import { flatten } from 'fp-ts/Array';
import { Functor } from 'fp-ts/Functor';
import { HKT } from 'fp-ts/HKT';
import { isNone, none, Option, some, Apply as OptApply } from 'fp-ts/Option';
import { Task } from 'fp-ts/Task';

/**
 * Functor 只能解决
 *
 * ```
 * f: (a: A) => F<B>
 * g: (b: B) => C
 * lift_g: (b: F<B>) => F<C>
 *
 * (lift_g ∘ f) = lift_g(f(a: A)) => F<C>
 * ```
 *
 * Functor 受限于 f 只能接受一个参数, 为了解决这个问题引入了 Applicative.
 *
 * 解决思路: 在函数编程中将多个参数改为一个参数的函数, 首选 curry
 *
 * ```
 * g: (b: B, c: C) => D
 * ```
 *
 * *After curry:
 * ```
 * g: (b: B) => (c: C) => D
 * ```
 *
 * 现在 curry 后的 g 变成接收一个参数的函数只不过它返回的是一个函数而不是某个 type (eg. A,B,C...).
 * 我们可以用 liftA2(为了和只接收一个参数的 lift 区别) 来表达:
 * ```
 * liftA2_g: (fb: F<B>) => F<(c: C) => D>
 * ```
 *
 * 现在的问题是如何将 `F<(c: C) => D>` 的值转换成 `(fc: F<C>) => F<D>`
 * 这个转换动作有个特定的名字叫 unpack
 *
 * 为了解决这个问题, 首先需要引入一个抽象 Apply 它继承自 Functor, 并实现 ap 方法.
 * 其中 ap 方法实际是上面所描述的 unpack 的一个变形(调整了参数的顺序)
 * ```
 * unpack: <C, D>(fcd: F<(c: C) => D>) => (fc: F<C>) => F<D>
 * ap:     <C, D>(fcd: F<(c: C) => D>, fc: F<C>) => F<D>
 * ```
 *
 * ?NOTE: Apply 的用途是解决 map 函数接收的函数超过 1 个参数时所产生的问题.
 * ?      本质上 ap 函数是一个 unpack 操作.
 *
 * 那么 Apply 到底有什么实际用途, 请参考 'whatIsApplicative.spec.ts' 文件
 * 中的 '[applicativeArray.ap]' 测试代码来协助理解 Apply 即 ap 函数的用途.
 */

// # Apply
interface Apply<F> extends Functor<F> {
  ap: <C, D>(fcd: HKT<F, (c: C) => D>, fc: HKT<F, C>) => HKT<F, D>;
}

/**
 * 如果有一个方法能够将 type A 的值进行 lift, 并结合 Apply 就会很方便
 * 因此引入了 Applicative
 */

// # Applicative
interface Applicative<F> extends Apply<F> {
  of: <A>(a: A) => HKT<F, A>;
}

// Example (`F = Array`)
// of:  `A` lift to `Array<A>`
// map: `(a: A) => B` lift to `(fa: Array<A>) => Array<B>`
// ap:  `Array<(a: A) => Array<B>>` unpack to `(fa: Array<A>) => Array<B>`
export const applicativeArray = {
  of: <A>(a: A): Array<A> => [a],
  map: <A, B>(fa: Array<A>, f: (a: A) => B): Array<B> => fa.map(f),
  ap: <A, B>(fab: Array<(a: A) => B>, fa: Array<A>): Array<B> =>
    // flatten(fab.map((f) => fa.map(f))),
    flatten(fab.map((f) => applicativeArray.map(fa, f))),
};

// Example (`F = Option`)
export const applicativeOption = {
  of: <A>(a: A): Option<A> => some(a),
  map: <A, B>(fa: Option<A>, f: (a: A) => B): Option<B> =>
    isNone(fa) ? none : some(f(fa.value)),
  ap: <A, B>(fab: Option<(a: A) => B>, fa: Option<A>): Option<B> =>
    isNone(fab) ? none : applicativeOption.map(fa, fab.value),
};

// Example (`F = Task`)
export const applicativeTask = {
  of: <A>(a: A): Task<A> => () => Promise.resolve(a),
  map: <A, B>(fa: Task<A>, f: (a: A) => B): Task<B> => () => fa().then(f),
  ap: <A, B>(fab: Task<(a: A) => B>, fa: Task<A>): Task<B> => () =>
    // Promise.all([fab(), fa()]).then(([f, a]) => f(a)),
    fab().then((f) => applicativeTask.map(fa, f)()),
};

// ===== Lift =====
export type Curried2<B, C, D> = (b: B) => (c: C) => D;

export const liftA2 = <F>(
  F: Apply<F>
): (<B, C, D>(
  g: Curried2<B, C, D>
) => Curried2<HKT<F, B>, HKT<F, C>, HKT<F, D>>) => (g) => (fb) => (fc) =>
  F.ap(F.map(fb, g), fc);
