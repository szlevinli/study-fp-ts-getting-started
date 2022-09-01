import { pipe, increment } from 'fp-ts/function';
import { strict as assert } from 'assert';
import { option as Opt } from 'fp-ts';
import { Option } from 'fp-ts/Option';
import { IO } from 'fp-ts/IO';
import { Task } from 'fp-ts/Task';
import { Reader } from 'fp-ts/Reader';

// ----------------------------------------------------------------------------
// Example (`F = ReadonlyArray`)
// ----------------------------------------------------------------------------

const apRA =
  <A>(fa: ReadonlyArray<A>) =>
  <B>(fab: ReadonlyArray<(a: A) => B>): ReadonlyArray<B> => {
    const out: Array<B> = [];
    for (const f of fab) {
      for (const a of fa) {
        out.push(f(a));
      }
    }
    return out;
  };

const double = (n: number): number => n * 2;

assert.deepStrictEqual(
  pipe([double, increment], apRA([1, 2, 3])),
  [2, 4, 6, 2, 3, 4]
);

// ----------------------------------------------------------------------------
// Example (`F = Option`)
// ----------------------------------------------------------------------------

const apOpt =
  <A>(fa: Option<A>) =>
  <B>(fab: Option<(a: A) => B>): Option<B> =>
    pipe(
      fab,
      Opt.match(
        () => Opt.none,
        (f) =>
          pipe(
            fa,
            Opt.match(
              () => Opt.none,
              (a) => Opt.some(f(a))
            )
          )
      )
    );

assert.deepStrictEqual(pipe(Opt.some(double), apOpt(Opt.some(1))), Opt.some(2));
assert.deepStrictEqual(pipe(Opt.some(double), apOpt(Opt.none)), Opt.none);
assert.deepStrictEqual(pipe(Opt.none, apOpt(Opt.some(1))), Opt.none);
assert.deepStrictEqual(pipe(Opt.none, apOpt(Opt.none)), Opt.none);

// ----------------------------------------------------------------------------
// Example (`F = IO`)
// ----------------------------------------------------------------------------

const apIO =
  <A>(fa: IO<A>) =>
  <B>(fab: IO<(a: A) => B>): IO<B> =>
  () =>
    fab()(fa());

// ----------------------------------------------------------------------------
// Example (`F = Task`)
// ----------------------------------------------------------------------------

const apTask =
  <A>(fa: Task<A>) =>
  <B>(fab: Task<(a: A) => B>): Task<B> =>
  () =>
    Promise.all([fab(), fa()]).then(([f, a]) => f(a));

// ----------------------------------------------------------------------------
// Example (`F = Reader`)
// ----------------------------------------------------------------------------

const apReader =
  <R, A>(fa: Reader<R, A>) =>
  <B>(fab: Reader<R, (a: A) => B>): Reader<R, B> =>
  (r) =>
    fab(r)(fa(r));
