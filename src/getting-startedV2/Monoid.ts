import { semigroup as smi, monoid, apply, option, applicative } from 'fp-ts';
import { getLastMonoid } from 'fp-ts/lib/Option';

interface Monoid<A> extends smi.Semigroup<A> {
  readonly empty: A;
}

// Instances
const monoidSum: Monoid<number> = {
  concat: (x, y) => x + y,
  empty: 0,
};

const monoidProduct: Monoid<number> = {
  concat: (x, y) => x * y,
  empty: 1,
};

const monoidString: Monoid<string> = {
  concat: (x, y) => x + y,
  empty: '',
};

const monoidAll: Monoid<boolean> = {
  concat: (x, y) => x && y,
  empty: true,
};

const monoidAny: Monoid<boolean> = {
  concat: (x, y) => x || y,
  empty: false,
};

// Let's write some `Monoid` instances for more complex types.
type Point = {
  x: number;
  y: number;
};

const monoidPoint: Monoid<Point> = monoid.struct({
  x: monoidSum,
  y: monoidSum,
});

type Vector = {
  from: Point;
  to: Point;
};

const monoidVector: Monoid<Vector> = monoid.struct({
  from: monoidPoint,
  to: monoidPoint,
});

// Folding
monoid.concatAll(monoidSum)([1, 2, 3, 4]); // 10
monoid.concatAll(monoidProduct)([1, 2, 3, 4]); // 24
monoid.concatAll(monoidString)(['a', 'b', 'c']); // 'abc'
monoid.concatAll(monoidAll)([true, false, true]); // false
monoid.concatAll(monoidAny)([true, false, true]); // true

// Monoid for type constructors
const M = applicative.getApplicativeMonoid(option.Applicative)(monoidSum);

M.concat(option.some(1), option.none); // none
M.concat(option.some(1), option.some(2)); //some(3)
M.concat(option.some(8), M.empty); //some(8)

// We can derive two other monoid for `Option<A>`
// 1) `getFirstMonoid`
//    none,    none =>    none
//    some(a), none =>    some(a)
//    none,    some(a) => some(a)
//    some(a), some(b) => some(a)
const MFirst = option.getFirstMonoid<number>();

MFirst.concat(option.none, option.none); // none
MFirst.concat(option.some(1), option.none); // some(1)
MFirst.concat(option.none, option.some(1)); // some(1)
MFirst.concat(option.some(1), option.some(2)); // some(1)

// 2) `getLastMonoid`
//    none,    none =>    none
//    some(a), none =>    some(a)
//    none,    some(a) => some(a)
//    some(a), some(b) => some(b)
const MLast = option.getLastMonoid<number>();

MLast.concat(option.none, option.none); // none
MLast.concat(option.some(1), option.none); // some(1)
MLast.concat(option.none, option.some(1)); // some(1)
MLast.concat(option.some(1), option.some(2)); // some(2)

// As an example, `getLastMonoid` can be useful for managing optional values
interface Setting {
  fontFamily: option.Option<string>;
  fontSize: option.Option<number>;
  maxColumn: option.Option<number>;
}

const monoidSetting: Monoid<Setting> = monoid.struct({
  fontFamily: option.getLastMonoid<string>(),
  fontSize: option.getLastMonoid<number>(),
  maxColumn: option.getLastMonoid<number>(),
});

const workspaceSetting: Setting = {
  fontFamily: option.some('Courier'),
  fontSize: option.none,
  maxColumn: option.some(80),
};

const userSetting: Setting = {
  fontFamily: option.some('YaHei'),
  fontSize: option.some(12),
  maxColumn: option.none,
};

monoidSetting.concat(workspaceSetting, userSetting);
/* output:
{
  fontFamily: option.some('YaHei'),
  fontSize: option.some(12),
  maxColumn: option.some(80),
}
*/
