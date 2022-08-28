/**
 * How do we define a functor instance in `fp-ts`
 *
 * The following interface represents the model of some result we get by calling
 * some HTTP API:
 */

import { pipe } from 'fp-ts/function';
import { Functor1 } from 'fp-ts/Functor';

const URI = 'Response';

type URI = typeof URI;

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Response<A>;
  }
}

interface Response<A> {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: A;
}

const map =
  <A, B>(f: (a: A) => B) =>
  (fa: Response<A>): Response<B> => ({
    ...fa,
    body: f(fa.body),
  });

const Functor: Functor1<URI> = {
  URI,
  map: (fa, f) => pipe(fa, map(f)),
};
