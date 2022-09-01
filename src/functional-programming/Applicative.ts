import { strict as assert } from 'assert';
import { option as Opt, task as T } from 'fp-ts';
import { flow } from 'fp-ts/function';
import { Option } from 'fp-ts/Option';
import { Task } from 'fp-ts/Task';

/*
Applicative functor compose, meaning that given two applicative functor
`F` and `G`, their composition `F<G<A>>` is still an applicative functor.
*/

// ----------------------------------------------------------------------------
// Example (`F = Task`, `G = Option`)
// ----------------------------------------------------------------------------

type TaskOption<A> = Task<Option<A>>;

const of: <A>(a: A) => TaskOption<A> = flow(Opt.of, T.of);

const ap = <A>(
  fa: TaskOption<A>
): (<B>(fab: TaskOption<(a: A) => B>) => TaskOption<B>) =>
  flow(
    T.map((gab) => (ga: Option<A>) => Opt.ap(ga)(gab)),
    T.ap(fa)
  );

/*
`flow` 函数接受一个参数 `fab: TaskOption<(a: A) => B>
所以 `T.map` 函数对应的 `effectful` 是 `Option<(a: A) => B>`
所以 `gab` 的类型是 `Option<(a: A) => B>`
所以 `T.map` 返回的类型是 `Task<(ga: Option<A>) => Option<B>>`
最后 `T.ap` 将返回 `Task<Option<B>>`
*/

const isEven = (n: number): boolean => n % 2 === 0;

// fa
const TOnumber: TaskOption<number> = of(2);

// fab
const TOisEven: TaskOption<(a: number) => boolean> = of(isEven);

ap(TOnumber)(TOisEven)().then((v) => assert.deepStrictEqual(v, Opt.some(true)));
