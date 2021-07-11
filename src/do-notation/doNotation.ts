import { log } from 'fp-ts/lib/Console';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

type A = 'A';
type B = 'B';
type C = 'C';
type D = 'D';

declare const fa: () => T.Task<A>;
declare const fb: (a: A) => T.Task<B>;
declare const fc: (ab: { a: A; b: B }) => T.Task<C>;
declare const fd: (abc: { a: A; b: B; c: C }) => TE.TaskEither<Error, D>;

const c = T.Monad.chain(fa(), (a) => T.Monad.chain(fb(a), (b) => fc({ a, b })));

const d = T.Monad.chain(fa(), (a) =>
  T.Monad.chain(fb(a), (b) =>
    TE.Monad.chain(TE.fromTask(fc({ a, b })), (c) => fd({ a, b, c }))
  )
);

const d2 = pipe(
  T.bindTo('a')(fa()), // Task<{a: 'A'}>
  T.bind('b', ({ a }) => fb(a)), // Task<{a: 'A'; b: 'B'}>
  T.chainFirst(({ b }) => pipe(log(b), T.fromIO)), // execute `log(b)` and return Task<{a: 'A'; b: 'B'}>
  T.bind('c', ({ a, b }) => fc({ a, b })), // Task<{a: 'A'; b: 'B'; c: 'C'}>
  TE.fromTask, // TaskEither<unknown, {a: 'A'; b: 'B'; c: 'C'}>
  TE.bind('d', ({ a, b, c }) => fd({ a, b, c })), // TaskEither<Error, {a: 'A'; b: 'B'; c: 'C'; d: 'D'}>
  TE.map(({ d }) => d) // TaskEither<Error, 'D'>
);
