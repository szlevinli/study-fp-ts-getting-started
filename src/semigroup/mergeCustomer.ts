import {
  semigroup as SG,
  ord as O,
  number as N,
  array as A,
  boolean as B,
} from 'fp-ts';

export interface Customer {
  name: string;
  favouriteThings: Array<string>;
  registeredAt: number;
  lastUpdatedAt: number;
  hasMadePurchase: boolean;
}

const orgGetLonger: O.Ord<string> = O.contramap((s: string) => s.length)(N.Ord);

export const semigroupCustomer: SG.Semigroup<Customer> = SG.struct({
  // keep the longer name
  name: SG.max(orgGetLonger),
  // accumulate things
  favouriteThings: A.getMonoid<string>(),
  // keep the least recent date
  registeredAt: SG.min(N.Ord),
  // keep the most recent date
  lastUpdatedAt: SG.max(N.Ord),
  // Boolean semigroup under disjunction (or)
  hasMadePurchase: B.SemigroupAny,
});
