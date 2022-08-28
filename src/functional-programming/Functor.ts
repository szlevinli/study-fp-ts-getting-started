/**
 * Functor (map)
 *
 * - f: A -> F<B>
 * - g: B -> C
 *
 * lift `g: B -> Ç` to `map(g): F<B> -> F<C>`
 *
 * implement `f . g: A -> F<C>`
 */

import { strict as assert } from 'assert';
import { option as Opt, readonlyArray as RA } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';
import { Option } from 'fp-ts/Option';
import { Task } from 'fp-ts/Task';
import { Reader } from 'fp-ts/Reader';

// ----------------------------------------------------------------------------
// Example: (`F = ReadonlyArray`)
// ----------------------------------------------------------------------------

const mapRA =
  <B, C>(g: (b: B) => C) =>
  (fb: ReadonlyArray<B>): ReadonlyArray<C> =>
    fb.map(g);

interface User {
  readonly id: number;
  readonly name: string;
  readonly followers: ReadonlyArray<User>;
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers;
const getName = (user: User): string => user.name;

const getFollowersNames: (user: User) => ReadonlyArray<string> = flow(
  getFollowers,
  mapRA(getName)
);

const user: User = {
  id: 1,
  name: 'Ruth R. Gonzalez',
  followers: [
    { id: 2, name: 'Terry R. Emerson', followers: [] },
    { id: 3, name: 'Marsha J. Jos', followers: [] },
  ],
};

assert.deepStrictEqual(getFollowersNames(user), [
  'Terry R. Emerson',
  'Marsha J. Jos',
]);

// ----------------------------------------------------------------------------
// Example: (`F = Option`)
// ----------------------------------------------------------------------------

const mapOpt = <B, C>(g: (b: B) => C): ((fb: Option<B>) => Option<C>) =>
  Opt.match(
    () => Opt.none,
    (b) => Opt.some(g(b))
  );

const double = (n: number): number => n * 2;

const getDoubleHead: (as: ReadonlyArray<number>) => Option<number> = flow(
  RA.head,
  mapOpt(double)
);

assert.deepStrictEqual(getDoubleHead([1, 2, 3]), Opt.some(2));
assert.deepStrictEqual(getDoubleHead([]), Opt.none);

// ----------------------------------------------------------------------------
// Example: (`F = IO`)
// ----------------------------------------------------------------------------

const mapIO =
  <B, C>(g: (b: B) => C) =>
  (fb: IO<B>): IO<C> =>
  () =>
    g(fb());

interface User2 {
  readonly id: number;
  readonly name: string;
}

// a dummy in-memory database
const database: Record<number, User2> = {
  1: { id: 1, name: 'levin' },
  2: { id: 2, name: 'jessie' },
  3: { id: 3, name: 'emma' },
};

const getUser2 =
  (id: number): IO<User2> =>
  () =>
    database[id];
const getName2 = (user: User2): string => user.name;

const getUserName2: (id: number) => IO<string> = flow(
  getUser2,
  mapIO(getName2)
);

assert.deepStrictEqual(pipe(1, getUserName2)(), 'levin');
assert.deepStrictEqual(pipe(2, getUser2, mapIO(getName2))(), 'jessie');

// ----------------------------------------------------------------------------
// Example: (`F = Task`)
// ----------------------------------------------------------------------------

const mapTask =
  <B, C>(g: (b: B) => C) =>
  (fb: Task<B>): Task<C> =>
  () =>
    fb().then(g);

const getUserFromRemote =
  (id: number): Task<User2> =>
  () =>
    Promise.resolve(database[id]);

pipe(3, getUserFromRemote, mapTask(getName2))().then((v) =>
  assert.deepStrictEqual(v, 'emma')
);

// ----------------------------------------------------------------------------
// Example: (`F = Reader`)
// ----------------------------------------------------------------------------

const mapReader =
  <B, C>(g: (b: B) => C) =>
  <R>(fb: Reader<R, B>): Reader<R, C> =>
  (r) =>
    g(fb(r));

interface Env {
  readonly database: Record<string, User2>;
}

const getUserFromEnv =
  (id: number): Reader<Env, User2> =>
  (env) =>
    env.database[id];

assert.deepStrictEqual(
  pipe(1, getUserFromEnv, mapReader(getName2))({ database }),
  'levin'
);
