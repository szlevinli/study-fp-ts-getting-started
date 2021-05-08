import { Functor } from './Functor';

// unique identifier
export const URI = 'Option';

export type URI = typeof URI;

export class None {
  readonly _URI!: URI;
  readonly _A!: never;
  readonly tag: 'None' = 'None';
}

export class Some<A> {
  readonly _URI!: URI;
  readonly _A!: A;
  readonly tag: 'Some' = 'Some';
  constructor(readonly value: A) {}
}

export type Option<A> = None | Some<A>;

export const none: Option<never> = new None();
export const some = <A>(a: A): Option<A> => new Some(a);

const map = <A, B>(f: (a: A) => B, fa: Option<A>): Option<B> => {
  switch (fa.tag) {
    case 'None':
      return fa;
    case 'Some':
      return some(f(fa.value));
  }
};

export const option: Functor<URI> = {
  map,
};
