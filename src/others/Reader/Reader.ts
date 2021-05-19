import { Reader, ask, chain } from 'fp-ts/Reader';
import { pipe } from 'fp-ts/function';

interface Dependencies {
  i18n: {
    true: string;
    false: string;
  };
  lowerBound: number;
}

const dep: Dependencies = {
  i18n: {
    true: '真',
    false: '假',
  },
  lowerBound: 2,
};

//
// origin
//

const f = (b: boolean): string => (b ? 'true' : 'false');

const g = (n: number): string => f(n > 2);

const h = (s: string): string => g(s.length + 1);

console.log(`h('foo'): ${h('hoo')}`);

//
// 需要增加国际化需求
// 第一版
//

const f1 = (b: boolean) => (deps: Dependencies) =>
  b ? deps.i18n.true : deps.i18n.false;

const g1 = (n: number) => f1(n > 2);

const h1 = (s: string) => g1(s.length + 1);

console.log(`h1('foo')(dep): ${h1('hoo')(dep)}`);

//
// 第二版: 采用 `Reader`
//

const f2 =
  (b: boolean): Reader<Dependencies, string> =>
  (deps) =>
    b ? deps.i18n.true : deps.i18n.false;

const g2 = (n: number): Reader<Dependencies, string> => f2(n > 2);

const h2 = (s: string): Reader<Dependencies, string> => g2(s.length + 1);

console.log(`h2('foo')(dep): ${h2('hoo')(dep)}`);

//
// 第三版: 依赖条件增加了一个 `lowerBound`
//

// `f2` 不做改变
const f3 = f2;

// 因为增加的这个依赖条件 `lowerBound` 对 `g` 函数有影响
// 因此我们需要重构 `g` 函数
const g3 = (n: number): Reader<Dependencies, string> =>
  pipe(
    ask<Dependencies>(),
    chain((deps) => f3(n > deps.lowerBound))
  );

// 调用新版 `g3`
const h3 = (s: string): Reader<Dependencies, string> => g3(s.length + 1);

console.log(`h3('foo')(dep): ${h3('hoo')(dep)}`);
console.log(
  `h3('foo')({...dep, lowerBound: 4}): ${h3('hoo')({ ...dep, lowerBound: 4 })}`
);

//
// 第四版: 依赖条件增加了一个 `lowerBound`
// 不使用 `Reader`
//

const f4 = (b: boolean) => (deps: Dependencies) =>
  b ? deps.i18n.true : deps.i18n.false;

// 因为增加的这个依赖条件 `lowerBound` 对 `g` 函数有影响
// 因此我们需要重构 `g` 函数
const g4 = (n: number) => (deps: Dependencies) => f4(n > deps.lowerBound);

const h4 = (s: string) => g4(s.length + 1);

// 不使用 `Reader` 的问题出现了, 调用开始变得复杂且难以理解了
console.log(`h4('hoo')(dep)(dep): ${h4('hoo')(dep)(dep)}`);
console.log(
  `h4('hoo')({ ...dep, lowerBound: 4 })(dep): ${h4('hoo')({
    ...dep,
    lowerBound: 4,
  })(dep)}`
);
