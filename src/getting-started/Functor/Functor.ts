import { HKT } from './HKT';

export interface Functor<F> {
  map: <A, B>(f: (a: A) => B, fa: HKT<F, A>) => HKT<F, B>;
}
