import { eq, ord } from 'fp-ts';

type Ordering = -1 | 0 | 1;

interface Ord<A> extends eq.Eq<A> {
  readonly compare: (x: A, y: A) => Ordering;
}

const ordNumber: Ord<number> = {
  equals: (x, y) => x === y,
  compare: (x, y) => (x < y ? -1 : x > y ? 1 : 0),
};

// 我们可以使用 `fromCompare` 来创建某个类型的 `Ord`s instance
const ordNumber2: ord.Ord<number> = ord.fromCompare((x, y) =>
  x < y ? -1 : x > y ? 1 : 0
);

// 下面我们使用 `Ord` 来实现 `min` 函数
function min<A>(O: ord.Ord<A>): (x: A, y: A) => A {
  return (x, y) => (O.compare(x, y) === 1 ? y : x);
}

// 自定义类型的 `Ord`s instance implement
type User = {
  name: string;
  age: number;
};

const byAge: ord.Ord<User> = ord.fromCompare((x, y) =>
  ordNumber.compare(x.age, y.age)
);

// 我们可以使用 `contramap` 来避免上面这些为类型实现 `Ord` 实例的样板代码
const byAge2: ord.Ord<User> = ord.contramap((user: User) => user.age)(
  ordNumber
);

const getYounger = min(byAge);

// 如果我们实现 `max` 呢, 它是 `min` 的反向排序
// `reverse` 可以便利的通过 `min` 来实现
function max<A>(O: ord.Ord<A>): (x: A, y: A) => A {
  return min(ord.reverse(O));
}
