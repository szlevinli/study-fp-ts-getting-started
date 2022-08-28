import { strict as assert } from 'assert';
import {
  eq as E,
  monoid as Mid,
  number as Num,
  option as Opt,
  ord as O,
  string as Str,
  semigroup as Sem,
} from 'fp-ts';
import { Eq } from 'fp-ts/Eq';
import { pipe } from 'fp-ts/function';
import { Monoid } from 'fp-ts/Monoid';
import { Option } from 'fp-ts/Option';
import { Semigroup } from 'fp-ts/Semigroup';
import { Ord } from 'fp-ts/Ord';

/**
 * 这部分内容主要是阐述将 `Option<A>` 如何应用到 `Eq`, `Ord`, `Semigroup`, `Monoid`
 *
 * 即, 如何处理诸如 `Eq<Option<A>>`, `Ord<Option<A>>`, `Semigroup<Option<A>>`
 * `Monoid<Option<A>>`
 *
 * 思路是通过 `combinator` 设计模式. 即如果我们有 `Eq<A>` 那么就可以扩展成 `Eq<Option<A>>`
 * 这种思路同样可以应到 `Ord<Option<A>>`, `Semigroup<Option<A>>`, `Monoid<Option<A>>`
 */

/*
Option<string> for Eq
*/

const o1: Option<string> = Opt.none;
const o2: Option<string> = Opt.some('a');

const result: boolean = pipe(
  o1,
  Opt.match(
    () =>
      pipe(
        o2,
        Opt.match(
          () => true,
          () => false
        )
      ),
    (a) =>
      pipe(
        o2,
        Opt.match(
          () => false,
          (b) => a == b
        )
      )
  )
);

/*
Generic
*/

const getEq = <A>(E: Eq<A>): Eq<Option<A>> => ({
  equals: (first, second) =>
    pipe(
      first,
      Opt.match(
        () =>
          pipe(
            second,
            Opt.match(
              () => true,
              () => false
            )
          ),
        (a) =>
          pipe(
            second,
            Opt.match(
              () => false,
              (b) => E.equals(a, b)
            )
          )
      )
    ),
});

const EqOptionString = getEq(Str.Eq);

assert.deepStrictEqual(EqOptionString.equals(Opt.none, Opt.none), true);
assert.deepStrictEqual(EqOptionString.equals(Opt.none, Opt.some('b')), false);
assert.deepStrictEqual(EqOptionString.equals(Opt.some('a'), Opt.none), false);
assert.deepStrictEqual(
  EqOptionString.equals(Opt.some('a'), Opt.some('b')),
  false
);
assert.deepStrictEqual(
  EqOptionString.equals(Opt.some('a'), Opt.some('a')),
  true
);

/*
Eq<Option<readonly [string, number]>>
*/

type MyTuple = [string, number];

const EqMyTuple = E.tuple<MyTuple>(Str.Eq, Num.Eq);

const EqOptionMyTuple = getEq(EqMyTuple);

const o11: Option<MyTuple> = Opt.some(['a', 1]);
const o22: Option<MyTuple> = Opt.some(['a', 2]);
const o33: Option<MyTuple> = Opt.some(['b', 1]);

assert.deepStrictEqual(EqOptionMyTuple.equals(o11, o11), true);
assert.deepStrictEqual(EqOptionMyTuple.equals(o11, o22), false);
assert.deepStrictEqual(EqOptionMyTuple.equals(o11, o33), false);

/*
Ord<Option<readonly [string, number]>>
*/

const OrdMyTuple = O.tuple<MyTuple>(Str.Ord, Num.Ord);

const OrdOptionMyTuple = Opt.getOrd(OrdMyTuple);

assert.deepStrictEqual(OrdOptionMyTuple.compare(o11, o11), 0);
assert.deepStrictEqual(OrdOptionMyTuple.compare(o11, o22), -1);
assert.deepStrictEqual(OrdOptionMyTuple.compare(o11, o33), -1);

/*
Semigroup<Option<A>>
*/

// 其实一开始并不理解为什么是 `getApplySemigroup`, 这个 `Apply` 应该怎么理解.
// 直到看到了...
const getApplySemigroup = <A>(S: Semigroup<A>): Semigroup<Option<A>> => ({
  concat: (x, y) =>
    pipe(
      x,
      Opt.match(
        () => Opt.none,
        (a) =>
          pipe(
            y,
            Opt.match(
              () => Opt.none,
              (b) => Opt.some(S.concat(a, b))
            )
          )
      )
    ),
});

const SO = getApplySemigroup(Str.Semigroup);

assert.deepStrictEqual(SO.concat(Opt.none, Opt.none), Opt.none);
assert.deepStrictEqual(SO.concat(Opt.some('a'), Opt.none), Opt.none);
assert.deepStrictEqual(SO.concat(Opt.none, Opt.some('a')), Opt.none);
assert.deepStrictEqual(SO.concat(Opt.some('a'), Opt.some('b')), Opt.some('ab'));

// ...这个, 理解了 `Apply` 的含义
const getApplySemigroup_S = <A>(S: Semigroup<A>): Semigroup<Option<A>> => ({
  concat: (x, y) =>
    pipe(
      x,
      Opt.map((a) => (b: A) => S.concat(a, b)),
      Opt.ap(y)
    ),
});

const SO_S = getApplySemigroup_S(Str.Semigroup);

assert.deepStrictEqual(SO_S.concat(Opt.none, Opt.none), Opt.none);
assert.deepStrictEqual(SO_S.concat(Opt.some('a'), Opt.none), Opt.none);
assert.deepStrictEqual(SO_S.concat(Opt.none, Opt.some('a')), Opt.none);
assert.deepStrictEqual(
  SO_S.concat(Opt.some('a'), Opt.some('b')),
  Opt.some('ab')
);

/*
Monoid<Option<A>>
*/

const getApplicativeMonoid = <A>(M: Monoid<A>): Monoid<Option<A>> => ({
  concat: (first, second) =>
    pipe(
      first,
      Opt.map((a) => (b: A) => M.concat(a, b)),
      Opt.ap(second)
    ),
  empty: Opt.some(M.empty),
});

const MO = getApplicativeMonoid(Str.Monoid);

assert.deepStrictEqual(MO.concat(Opt.none, Opt.none), Opt.none);
assert.deepStrictEqual(MO.concat(Opt.some('a'), Opt.none), Opt.none);
assert.deepStrictEqual(MO.concat(Opt.none, Opt.some('a')), Opt.none);
assert.deepStrictEqual(MO.concat(Opt.some('a'), Opt.some('b')), Opt.some('ab'));
assert.deepStrictEqual(MO.concat(Opt.some('a'), MO.empty), Opt.some('a'));
assert.deepStrictEqual(MO.concat(MO.empty, Opt.some('a')), Opt.some('a'));

/*
none none -> none
none some -> some
some none -> some
some some -> some
*/

const getMonoid = <A>(S: Semigroup<A>): Monoid<Option<A>> => ({
  concat: (first, second) =>
    pipe(
      first,
      Opt.match(
        () =>
          pipe(
            second,
            Opt.match(
              () => Opt.none,
              (b) => Opt.some(b)
            )
          ),
        (a) =>
          pipe(
            second,
            Opt.match(
              () => Opt.some(a),
              (b) => Opt.some(S.concat(a, b))
            )
          )
      )
    ),
  empty: Opt.none,
});

const MO2 = getMonoid(Num.SemigroupSum);

assert.deepStrictEqual(MO2.concat(Opt.none, Opt.none), Opt.none);
assert.deepStrictEqual(MO2.concat(Opt.some(1), Opt.none), Opt.some(1));
assert.deepStrictEqual(MO2.concat(Opt.none, Opt.some(2)), Opt.some(2));
assert.deepStrictEqual(MO2.concat(Opt.some(1), Opt.some(2)), Opt.some(3));
assert.deepStrictEqual(MO2.concat(Opt.some(1), MO2.empty), Opt.some(1));
assert.deepStrictEqual(MO2.concat(MO2.empty, Opt.some(2)), Opt.some(2));

assert.deepStrictEqual(
  Mid.concatAll(MO2)([Opt.some(1), Opt.some(2), Opt.none, Opt.some(3)]),
  Opt.some(6)
);

const getMonoid_S = <A>(S: Semigroup<A>): Monoid<Option<A>> => ({
  concat: (first, second) =>
    Opt.isNone(first)
      ? second
      : Opt.isNone(second)
      ? first
      : Opt.some(S.concat(first.value, second.value)),
  empty: Opt.none,
});

const getMonoid_S2 = <A>(S: Semigroup<A>): Monoid<Option<A>> => ({
  concat: (first, second) => {
    if (Opt.isNone(first)) {
      return second;
    } else if (Opt.isNone(second)) {
      return first;
    } else {
      return Opt.some(S.concat(first.value, second.value));
    }
  },
  empty: Opt.none,
});

/*
limit 80
*/

const upper =
  <A>(u: A) =>
  (Oi: Ord<A>) =>
  (S: Semigroup<A>): Semigroup<A> => ({
    concat: (first, second) => Sem.min(Oi).concat(u, S.concat(first, second)),
  });

const MonoidMaxColumn80 = Opt.getMonoid(upper(80)(Num.Ord)(Sem.last()));

assert.deepStrictEqual(
  MonoidMaxColumn80.concat(Opt.some(120), Opt.some(150)),
  Opt.some(80)
);
assert.deepStrictEqual(
  MonoidMaxColumn80.concat(Opt.some(120), Opt.some(75)),
  Opt.some(75)
);
