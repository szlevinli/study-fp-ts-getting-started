import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import * as RE from 'fp-ts/ReaderEither';

declare function f(s: string): E.Either<Error, number>;
declare function g(n: number): boolean;
declare function h(b: boolean): E.Either<Error, Date>;

// composing `f`, `g` and `h`
const result = pipe(E.right('foo'), E.chain(f), E.map(g), E.chain(h));

// PointFree Style
const pointFreeVersion = flow(f, E.map(g), E.chain(h));

interface Dependencies {
  foo: string;
}

// Must refactor `f`
declare function f2(s: string): RE.ReaderEither<Dependencies, Error, number>;

const result2 = pipe(
  RE.right('foo'),
  RE.chain(f2),
  RE.map(g),
  RE.chain((d) => RE.fromEither(h(d)))
);

const pointFreeVersion2 = flow(
  RE.chain(f2),
  RE.map(g),
  RE.chain((d) => RE.fromEither(h(d)))
);
