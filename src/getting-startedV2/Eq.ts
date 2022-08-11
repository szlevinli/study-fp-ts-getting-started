import { eq, array } from 'fp-ts';

// type class for Eq
interface Eq<A> {
  readonly equals: (x: A, y: A) => boolean;
}

// instance of `Eq` for `number`
const eqNumber: Eq<number> = {
  equals: (x, y) => x === y,
};

type ElemReturn<A> = (a: A) => (as: Array<A>) => boolean;

// 通过 `Eq`s instance 实现 `elem` 函数
function elem<A>(E: Eq<A>): ElemReturn<A> {
  return (a) => (as) => as.some((item) => E.equals(a, item));
}

type Point = {
  x: number;
  y: number;
};

// instance of `Eq` for `Point`
const eqPoint: Eq<Point> = {
  equals: (p1, p2) => p1 === p2 || (p1.x === p2.x && p1.y === p2.y),
};

// 为类型创建 `Eq` 实例非常类似, 因此 `fp-ts` 提供了一些 `combinator` 来简化这个过程
// 我们可以使用 `struct` 函数来创建上面 `Point` 的 `Eq` 实例
const eqPoint2: Eq<Point> = eq.struct({
  x: eqNumber,
  y: eqNumber,
});

// 我们还可以使用 `fp-ts` 其他包中提供的 `getEq` 函数来获取某种类型的 `Eq` 实例
// 比如 `Array`
const eqArrayOfPoints: Eq<Array<Point>> = array.getEq(eqPoint);

// 最后我们还可以使用 `contramap` 来为某个类型提供 `Eq`s instance
// `contramap` 需要一个 `B -> A` 的函数以及 `A` 的 `Eq`s instance
// 在下面的范例中, `B` 指的是 `User`, `A` 指的是 `number`
type User = {
  userId: number;
  name: string;
};

const eqUser: Eq<User> = eq.contramap((user: User) => user.userId)(eqNumber);
