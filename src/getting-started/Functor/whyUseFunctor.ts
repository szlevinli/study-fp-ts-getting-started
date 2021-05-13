import { functor as FCT } from 'fp-ts';

// create instance for Functor
// Note: `Response` 非常适合去创建一个函子, 因为其 type constructors 有一个参数 <A>
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

export const map = <A, B>(fa: Response<A>, f: (a: A) => B): Response<B> => ({
  ...fa,
  body: f(fa.body),
});

export const functorResponse: FCT.Functor1<URI> = {
  URI,
  map,
};
