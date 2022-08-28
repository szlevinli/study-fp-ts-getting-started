import { strict as assert } from 'assert';
import { flow, pipe } from 'fp-ts/function';
import { Task } from 'fp-ts/Task';
import { Option } from 'fp-ts/Option';
import { task as T, option as Opt } from 'fp-ts';

type TaskOption<A> = Task<Option<A>>;

const mapTO: <A, B>(f: (a: A) => B) => (fa: TaskOption<A>) => TaskOption<B> =
  flow(Opt.map, T.map);

interface User {
  readonly id: number;
  readonly name: string;
}

const database: Record<number, User> = {
  1: { id: 1, name: 'levin' },
  2: { id: 2, name: 'jessie' },
  3: { id: 3, name: 'emma' },
};

const getUser =
  (id: number): TaskOption<User> =>
  () =>
    Promise.resolve(Opt.fromNullable(database[id]));

const getName = (user: User): string => user.name;

pipe(1, getUser, mapTO(getName))().then((v) =>
  assert.deepStrictEqual(v, Opt.some('levin'))
);

pipe(9, getUser, mapTO(getName))().then((v) =>
  assert.deepStrictEqual(v, Opt.none)
);
