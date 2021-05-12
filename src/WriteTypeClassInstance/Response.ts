import { Functor1 } from 'fp-ts/Functor';

/**
 * 为自定义类型 `Response` 创建一个 `Functor` 的实例
 */

export interface Response<A> {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: A;
}

export const URI = 'Response';
export type URI = typeof URI;

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Response<A>;
  }
}

export const response: Functor1<URI> = {
  URI,

  // <A, B>(fa: Response<A>, f: (a: A) => B) => Response<B>
  map: <A, B>(fa: Response<A>, f: (a: A) => B): Response<B> => ({
    ...fa,
    body: f(fa.body),
  }),
};
