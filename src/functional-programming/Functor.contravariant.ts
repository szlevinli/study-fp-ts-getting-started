/**
 * Functor 有两类
 *
 * - covariant functor: 协变函子. 用 `map` 函数
 * - contravariant functor: 逆变函子. 用 `contramap` 函数
 *
 * covariant functor:
 * `f: A -> B` to `map(f): F<A> -> F<B>`
 *
 * contravariant functor:
 * `f: A -> B` to `contramap(f): F<B> -> F<A>`
 */

import { option as Opt, eq as E, number as Num } from 'fp-ts';
import { Option } from 'fp-ts/Option';
import { Eq } from 'fp-ts/Eq';
import { strict as assert } from 'assert';

type User = {
  readonly id: number;
  readonly name: string;
};

const getId = (user: User): number => user.id;

// map
const getIdOption: (fa: Option<User>) => Option<number> = Opt.map(getId);

// contramap
const getIdEq: (fa: Eq<number>) => Eq<User> = E.contramap(getId);

assert.deepStrictEqual(
  getIdEq(Num.Eq).equals({ id: 1, name: 'levin' }, { id: 1, name: 'jessie' }),
  true
);
