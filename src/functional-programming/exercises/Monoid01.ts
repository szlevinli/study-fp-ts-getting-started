import { number as N, readonlyArray as RA } from 'fp-ts';
import { Monoid, concatAll } from 'fp-ts/Monoid';
import { flow, pipe } from 'fp-ts/function';

const foldMap =
  <B>(M: Monoid<B>) =>
  <A>(f: (a: A) => B) =>
  (as: ReadonlyArray<A>): B =>
    as.reduce((acc, a) => M.concat(acc, f(a)), M.empty);

const foldMap2 =
  <B>(M: Monoid<B>) =>
  <A>(f: (a: A) => B) =>
  (as: ReadonlyArray<A>): B =>
    pipe(as, RA.map(f), concatAll(M));

// ------------------------------------
// solution
// ------------------------------------
const foldMap_S =
  <B>(M: Monoid<B>): (<A>(f: (a: A) => B) => (as: ReadonlyArray<A>) => B) =>
  (f) =>
    flow(RA.map(f), concatAll(M));

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert';

interface Bonifico {
  readonly causale: string;
  readonly importo: number;
}

const bonifici: ReadonlyArray<Bonifico> = [
  { causale: 'causale1', importo: 1000 },
  { causale: 'causale2', importo: 500 },
  { causale: 'causale3', importo: 350 },
];

// calcola la somma dei bonifici
assert.deepStrictEqual(
  pipe(
    bonifici,
    foldMap(N.MonoidSum)((bonifico) => bonifico.importo)
  ),
  1850
);
