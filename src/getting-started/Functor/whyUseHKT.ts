// defined
export class None {
  readonly tag: 'None' = 'None';
}

export class Some<A> {
  readonly tag: 'Some' = 'Some';
  constructor(readonly value: A) {}
}

export type Option<A> = None | Some<A>;

// helpers
export const none: Option<never> = new None();
export const some = <A>(a: A) => new Some(a);

// a special map for Option
export const map = <A, B>(f: (a: A) => B, fa: Option<A>): Option<B> => {
  switch (fa.tag) {
    case 'None':
      return fa;
    case 'Some':
      return some(f(fa.value));
  }
};

/**
 * 现在我们需要将 map 再进行抽象, 即创建 Functor 接口, 那么我们会碰到如下问题
 *
 * ```
 * interface Functor {
 *   map: <A, B>(f: (a: A) => B, fa: ?) => ?
 * }
 * ```
 *
 * 我们没有办法泛化"泛化类型", 如果我们这样设计
 *
 * ```
 * interface Functor {
 *   map: <A, B, F>(f: (a: A) => B, fa: F<A>) => F<B>
 * }
 * ```
 *
 * 上面的写法, Typescript 会报错 'Type `F` is not generic.'
 *
 * 这个问题就是所谓的: "Typescript 不支持 higher kinded types" (缩写: HKT)
 *
 * 鉴于上述情况那就 fake 出一个 HKT, 具体实现详见 './HKT.ts'
 *
 * 关于 HKT 在 Typescript 的详细说见: [fp-ts-technical-overview](https://gist.github.com/gcanti/2b455c5008c2e1674ab3e8d5790cdad5)
 */
