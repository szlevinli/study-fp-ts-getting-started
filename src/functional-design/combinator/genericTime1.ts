import { now } from 'fp-ts/Date';
import {
  IO,
  Monad as ioMonad,
  map as ioMap,
  Apply as ioApply,
  chain as ioChain,
} from 'fp-ts/IO';
import { log } from 'fp-ts/Console';
import { fibonacci } from './helper';
import { randomInt } from 'fp-ts/Random';
import { getApplySemigroup } from 'fp-ts/Apply';
import { NonEmptyArray, head, tail } from 'fp-ts/NonEmptyArray';
import { contramap as ordContramap } from 'fp-ts/Ord';
import { Ord as numberOrd } from 'fp-ts/number';
import {
  min as semigroupMin,
  concatAll as semigroupConcatAll,
} from 'fp-ts/Semigroup';
import { fst as tupleFst } from 'fp-ts/Tuple';

// 实现计算指定操作(action)的耗时

// time 函数接收一个 action (使用 IO<A> 的实例来表示), 返回一个 tuple [A, number]
// A: action 执行的结果
// number: action 执行的时间
export const time = <A>(ma: IO<A>): IO<[A, number]> =>
  ioMonad.chain(now, (start) =>
    ioMonad.chain(ma, (a) => ioMonad.map(now, (end) => [a, end - start]))
  );

// 扩展上面的 time 函数
// 实现将程序运行的结果以及耗时输出到控制台, 同时将运行结果返回
// 这里需要注意, 返回的类型是 IO<A>, 也就是程序运行的结果 A 是在 IO 类型中
export const withLogging = <A>(ma: IO<A>): IO<A> =>
  ioMonad.chain(time(ma), ([result, mills]) =>
    ioMonad.map(log(`Result: ${result}, Elapsed: ${mills}`), () => result)
  );

const program = withLogging(ioMap(fibonacci)(randomInt(30, 35)));

// 再进一步, 还是使用 time 来计算若干 action 中执行速度最快的 action
export const fastest = <A>(xs: NonEmptyArray<IO<A>>): IO<A> => {
  // 因为 time 返回 IO<[A, number]>
  // 因此我们需要提供数据结构为: tuple [A, number] 的 Ord 实例
  // 也就是 Ord<[A, number]>
  // Ord 包中提供的 contramap 函数可以为我们实现这一目标
  // 也就是利用 Ord<number> 逆向 map 生成 Ord<[A, number]>
  const ordTuple = ordContramap(([_, elapsed]: [A, number]) => elapsed)(
    numberOrd
  );
  // Semigroup 包提供的 min 函数可以使用一个 Ord 的实例来创建 Semigroup 实例
  // 这个 Semigroup 实例的 concat 方法可以返回两个数据中小的那个
  // semigroupMin :: Ord a -> Semigroup a
  const minTuple = semigroupMin(ordTuple);
  // 将一个包含[A, number] 的 Semigroup 实例
  // 提升为包含 IO<[A, number]> 的 Semigroup 实例
  const semigroupIO = getApplySemigroup(ioApply)(minTuple);
  const fastest = semigroupConcatAll(semigroupIO)(time(head(xs)))(
    tail(xs).map((x) => time(x))
  );
  return ioMap(tupleFst)(fastest);
};

const program2 = ioMonad.chain(fastest([program, program, program]), (x) =>
  log(`Fastest result is: ${x}`)
);

program2();
