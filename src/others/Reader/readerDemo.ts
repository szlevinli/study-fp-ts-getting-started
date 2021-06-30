import { Reader, ask, chain } from 'fp-ts/Reader';
import { pipe } from 'fp-ts/function';

export interface Dependencies {
  i18n: {
    true: string;
    false: string;
  };
  lowerBound: number;
}

//
// origin
//

const f = (b: boolean): string => (b ? 'true' : 'false');

const g = (n: number): string => f(n > 2);

export const h = (s: string): string => g(s.length + 1);

//
// 需要增加国际化需求
// 第一版
//

const f1 = (b: boolean, deps: Dependencies) =>
  b ? deps.i18n.true : deps.i18n.false;

const g1 = (n: number, deps: Dependencies) => f1(n > 2, deps);

export const h1 = (s: string, deps: Dependencies) => g1(s.length + 1, deps);

//
// 第二版: 采用 `Reader`
//

// const f2_tmp =
//   (b: boolean): ((deps: Dependencies) => string) =>
//   (deps) =>
//     b ? deps.i18n.true : deps.i18n.false;

// const g2_tmp = (n: number): ((deps: Dependencies) => string) => f2_tmp(n > 2);

// const h2_tmp = (s: string): ((deps: Dependencies) => string) =>
//   g2_tmp(s.length + 1);

// `Reader<Dependencies, string> = (deps: Dependencies) => string`

const f2 =
  (b: boolean): Reader<Dependencies, string> =>
  (deps) =>
    b ? deps.i18n.true : deps.i18n.false;

const g2 = (n: number): Reader<Dependencies, string> => f2(n > 2);

export const h2 = (s: string): Reader<Dependencies, string> => g2(s.length + 1);

//
// 第三版: 依赖条件增加了一个 `lowerBound`
//

const f3 =
  (b: boolean): Reader<Dependencies, string> =>
  (deps) =>
    b ? deps.i18n.true : deps.i18n.false;

// 因为增加的这个依赖条件 `lowerBound` 对 `g` 函数有影响
// 因此我们需要重构 `g` 函数
const g3 = (n: number): Reader<Dependencies, string> =>
  pipe(
    ask<Dependencies>(),
    chain((deps) => f3(n > deps.lowerBound))
  );

// 调用新版 `g3`
export const h3 = (s: string): Reader<Dependencies, string> => g3(s.length + 1);
