import {
  apply,
  array as ary,
  boolean as bln,
  function as fn,
  number as nb,
  ord,
  semigroup as smi,
  option,
} from 'fp-ts';

interface Semigroup<A> {
  readonly concat: (x: A, y: A) => A;
}

// `Semigroup` 比较特殊对于某种类型会有多种实例的实现方式
// 比如: 对于 `number` 类型就会有 加法 乘法实例, 如下
const semigroupProduct: Semigroup<number> = {
  concat: (x, y) => x * y,
};

const semigroupSum: Semigroup<number> = {
  concat: (x, y) => x + y,
};

const semigroupString: Semigroup<string> = {
  concat: (x, y) => x + y,
};

// 对于那些非 `associative` 操作(即没有两个操作数, 只有一个操作数的情况)的实例
// 比如: 取 `tuple` 中的第一个元素这种实例化, 可用下面的方式实现
function getFirstSemigroup<A = never>(): Semigroup<A> {
  return {
    concat: (x, _) => x,
  };
}

function getSecondSemigroup<A = never>(): Semigroup<A> {
  return {
    concat: (_, y) => y,
  };
}

// Another technique is to define a semigroup instance for `Array<A>`
// called the **free semigroup** of `A`
function getArraySemigroup<A = never>(): Semigroup<Array<A>> {
  return {
    concat: (x, y) => x.concat(y),
  };
}

// There's another way to build a semigroup instance for a type `A`:
// If we already have an `Ord` instance for `A`,
// then we can "turn it" into a semigroup.
const semigroupMin: Semigroup<number> = smi.min(nb.Ord);

const semigroupMax: Semigroup<number> = smi.max(nb.Ord);

// Let's write some `Semigroup` instances for more complex types
type Point = {
  x: number;
  y: number;
};

const semigroupPoint: Semigroup<Point> = {
  concat: (p1, p2) => ({
    x: semigroupSum.concat(p1.x, p2.x),
    y: semigroupSum.concat(p1.y, p2.y),
  }),
};

// Again use combinator
const semigroupPoint2: Semigroup<Point> = smi.struct({
  x: semigroupSum,
  y: semigroupSum,
});

type Vector = {
  from: Point;
  to: Point;
};

const semigroupVector: Semigroup<Vector> = smi.struct({
  from: semigroupPoint,
  to: semigroupPoint,
});

// Given an instance of `Semigroup` for `S` we
// can derive an instance of `Semigroup` for functions
// with signature `(a: A) => S`, for all `A`
const semigroupPredicate: Semigroup<(p: Point) => boolean> = fn.getSemigroup(
  bln.SemigroupAll
)<Point>();

const isPositiveX = (p: Point): boolean => p.x >= 0;
const isPositiveY = (p: Point): boolean => p.y >= 0;

const isPositiveXY = semigroupPredicate.concat(isPositiveX, isPositiveY);

isPositiveXY({ x: 1, y: 1 }); // true
isPositiveXY({ x: 1, y: -1 }); // false
isPositiveXY({ x: -1, y: 1 }); // false
isPositiveXY({ x: -1, y: -1 }); // false

// Folding
// The `concatAll` function takes a semigroup instance,
// an initial value and an array of elements:
const sum = smi.concatAll(nb.SemigroupSum);

sum(0)([1, 2, 3, 4]); // 10

const product = smi.concatAll(nb.SemigroupProduct);

product(1)([1, 2, 3, 4]); // 24

// Semigroup for type constructors
// What if we want to "merge" two `Options<A>`?
const S = apply.getApplySemigroup(option.Apply)(nb.SemigroupSum);

S.concat(option.some(1), option.none); // none
S.concat(option.some(1), option.some(2)); // some(3)

// Let's imagine you're building some system in which you store
// customer records that look like this:
interface Customer {
  name: string;
  favouriteThings: Array<string>;
  registeredAt: number; // since epoch
  lastUpdatedAt: number; // since epoch
  hasMadePurchase: boolean;
}

// For whatever reason you might end up with duplicate records
// for the same person. What we need is a merge strategy.
// That's what semigroup are all about.
const semigroupCustomer: Semigroup<Customer> = smi.struct({
  // keep the longer name
  name: smi.max(ord.contramap((s: string) => s.length)(nb.Ord)),
  // accumulate things
  favouriteThings: ary.getMonoid<string>(),
  // keep the least recent date
  registeredAt: smi.min(nb.Ord),
  // keep the most recent date
  lastUpdatedAt: smi.max(nb.Ord),
  // Boolean semigroup under disjunction
  hasMadePurchase: bln.SemigroupAny,
});
