import { strict as assert } from 'assert';
import { getApplicativeMonoid } from 'fp-ts/Applicative';
import { log as ioLog } from 'fp-ts/Console';
import { now } from 'fp-ts/Date';
import { Eq, fromEquals } from 'fp-ts/Eq';
import { pipe } from 'fp-ts/function';
import {
  Applicative as ioApplicative,
  chain as ioChain,
  IO,
  Monad,
} from 'fp-ts/IO';
import { concatAll, Monoid } from 'fp-ts/Monoid';
import { Eq as EqNumber } from 'fp-ts/number';
import { randomInt } from 'fp-ts/Random';
import { replicate } from 'fp-ts/ReadonlyArray';
import { Eq as EqString, Monoid as MonoidString } from 'fp-ts/string';

//
// Example1: `Eq`
//

// 这个函数的用途是:
// 给定一个类型 A 的 Eq 实例, 衍生出 ReadonlyArray<A> 的 Eq 实例
export const getEq = <A>(E: Eq<A>): Eq<ReadonlyArray<A>> =>
  fromEquals(
    (xs, ys) =>
      xs.length === ys.length && xs.every((x, i) => E.equals(x, ys[i]))
  );

// Usage: getEq
// 根据 Eq<string> 创建出 Eq<ReadonlyArray<string>>
const stringsEq: Eq<readonly string[]> = getEq(EqString);

assert.deepStrictEqual(
  stringsEq.equals(['a', 'b', 'c'], ['a', 'b', 'c']),
  true
);
assert.deepStrictEqual(
  stringsEq.equals(['a', 'b', 'c'], ['a', 'c', 'b']),
  false
);
assert.deepStrictEqual(stringsEq.equals(['a', 'b', 'c'], ['a', 'b']), false);
assert.deepStrictEqual(
  stringsEq.equals(['a', 'b', 'c'], ['a', 'd', 'c']),
  false
);

// 这个函数是 map 的逆向操作
// 也就是说 map 函数使用 F<A> 和 (a: A) => B 来得到 F<B>
// 而 contramap 函数使用 F<A> 和 (b: B) => A 来得到 F<B>
// 这里的区别在于 (a: A) => B 和 (b: B) => A
export const contramap: <A, B>(f: (b: B) => A) => (E: Eq<A>) => Eq<B> =
  (f) => (E) =>
    fromEquals((x, y) => E.equals(f(x), f(y)));

// Usage: contramap
// 根据 Eq<number> 创建 Eq<Person>
type Person = {
  id: number;
  name: string;
};

const eqPerson: Eq<Person> = contramap((b: Person) => b.id)(EqNumber);

assert.deepStrictEqual(
  eqPerson.equals({ id: 1, name: 'levin' }, { id: 1, name: 'levin' }),
  true
);
assert.deepStrictEqual(
  eqPerson.equals({ id: 1, name: 'levin' }, { id: 1, name: 'levin2' }),
  true
);
assert.deepStrictEqual(
  eqPerson.equals({ id: 1, name: 'levin' }, { id: 2, name: 'levin' }),
  false
);

//
// Example2: `Monoid`
//

// 给定一个 Monoid<A>, 衍生一个 Monoid<IO<A>>
export const getMonoid = <A>(M: Monoid<A>): Monoid<IO<A>> =>
  getApplicativeMonoid(ioApplicative)(M);

// Usage: getMonoid
// 利用 Monoid<string> 衍生出 Monoid<IO<string>>
const ioStringMonoid: Monoid<IO<string>> = getMonoid(MonoidString);

assert.equal(
  ioStringMonoid.concat(
    () => 'hello ',
    () => 'world!'
  )(),
  'hello world!'
);
assert.equal(ioStringMonoid.empty(), MonoidString.empty);

// 创建一个类型是 void 的 Monoid 的实例
export const monoidVoid: Monoid<void> = {
  concat: () => undefined,
  empty: undefined,
};

export const replicateIO =
  (n: number) =>
  (mv: IO<void>): IO<void> =>
    concatAll(getMonoid(monoidVoid))(replicate(n, mv));

export const log =
  (msg: unknown): IO<void> =>
  () =>
    console.log(String(msg));

// curry
const fibonacci_ =
  (ac1: number) =>
  (ac2: number) =>
  (n: number): number =>
    n <= 1 ? ac2 : fibonacci_(ac2)(ac1 + ac2)(n - 1);

export const fibonacci = fibonacci_(1)(1);

export const printFib: IO<void> = pipe(
  randomInt(30, 35),
  ioChain((n) => log(fibonacci(n)))
);

replicateIO(3)(printFib)();

//
// Example 3: `IO`
//

export const time = <A>(ma: IO<A>): IO<A> =>
  Monad.chain(now, (start) =>
    Monad.chain(ma, (a) =>
      Monad.chain(now, (end) =>
        Monad.map(ioLog(`Elapsed: ${end - start}`), () => a)
      )
    )
  );

time(replicateIO(3)(printFib))();
time(replicateIO(3)(time(printFib)))();

console.log(`>>> End of program`);
