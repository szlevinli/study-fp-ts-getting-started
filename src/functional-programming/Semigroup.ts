/**
 * The dual Semigroup
 *
 * Given a semigroup instance, it is possible to obtain a new semigroup
 * instance by simply swapping the order in which the operands are combined.
 */

import {
  string as Str,
  semigroup as Se,
  readonlyNonEmptyArray as rNEA,
  ord,
  number as Num,
} from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { Semigroup } from 'fp-ts/Semigroup';
import { Ord } from 'fp-ts/Ord';
import { strict as assert } from 'node:assert';

// This is a semigroup combinator:
const reverse = <A>(S: Semigroup<A>): Semigroup<A> => ({
  concat: (first, second) => S.concat(second, first),
});

assert.strictEqual(Str.Semigroup.concat('a', 'b'), 'ab');
assert.strictEqual(reverse(Str.Semigroup).concat('a', 'b'), 'ba');

/**
 * Finding a Semigroup instance for any type
 */

// Support we have a type `User` defined as:
type User = {
  readonly id: number;
  readonly name: string;
  readonly createAt: number;
};

// and that inside my database we have multiple copies of the same `User`
// (e.g. they could be historical entries of its modifications)
declare const getCurrent_: (id: number) => User;
declare const getHistory_: (id: number) => ReadonlyArray<User>;

// and that we need to implement a public API:
declare const getUser_: (id: number) => User;

// which takes into account all of its copies depending on some criteria.
// The criteria should be to return the most recent copy,
// or the oldest one, or the current one, etc...
declare const getMostRecentUse_: (id: number) => User;
declare const getLeastRecentUse_: (id: number) => User;
declare const getCurrentUser_: (id: number) => User;

// Thus, to return a value of type `User` I need to consider all the copies
// and make a `merge` (or `selection`) of them, meaning I can model the criteria
// problem with a `Semigroup<User>`

/**
 * Free Semigroup of `A`
 *
 * You can always define a Semigroup instance for type `A` by defining a
 * semigroup not for `A` itself but for `NonEmptyArray<A>`
 *
 * represents a non-empty array, meaning an array that has at least on element A
 *
 * ```ts
 * type ReadonlyNonEmptyArray<A> = ReadonlyArray<A> & { readonly 0: A };
 * ```
 *
 * the concatenation of two NonEmptyArray is still a NonEmptyArray
 *
 * ```ts
 * const getSemigroup = <A>(): Semigroup<ReadonlyNonEmptyArray<A>> => ({
 * concat: (first, second) => [first[0], ...first.slice(1), ...second],
 * });
 * ```
 *
 * and the we can map the element of `A` to "singletons" of `ReadonlyNonEmptyArray<A>`,
 * meaning arrays with only on element.
 *
 * insert an element into a non-empty array
 *
 * ```ts
 * const of = <A>(a: A): ReadonlyNonEmptyArray<A> => [a];
 * ```
 *
 * this semigroup is not for the `User` type but for `ReadonlyNonEmptyArray<User>`
 *
 * ```ts
 * const S: Semigroup<ReadonlyNonEmptyArray<User>> = getSemigroup<User>();
 *
 * declare const user1: User;
 * declare const user2: User;
 * declare const user3: User;
 *
 * const merge = S.concat(S.concat(of(user1), of(user2)), of(user3));
 * const merge2: ReadonlyNonEmptyArray<User> = [user1, user2, user3];
 * ```
 */

const getCurrent = (id: number): User => ({
  id,
  name: 'levin',
  createAt: Date.parse('2022-08-20'),
});

const getHistory = (id: number): ReadonlyArray<User> => [
  { id, name: 'levin', createAt: Date.parse('1977-02-25') },
  { id, name: 'levin', createAt: Date.parse('1998-10-10') },
  { id, name: 'levin', createAt: Date.parse('2100-03-14') },
];

const getUser =
  (S: Semigroup<User>) =>
  (id: number): User => {
    const current = getCurrent(id);
    const history = getHistory(id);
    return rNEA.concatAll(S)([current, ...history]);
  };

const ordUser: Ord<User> = ord.contramap((user: User) => user.createAt)(
  Num.Ord
);

// get the least User
const leastUserSemigroup: Semigroup<User> = Se.min(ordUser);
const getLeastUser: (id: number) => User = getUser(leastUserSemigroup);

// get the recent User
const recentUserSemigroup: Semigroup<User> = Se.max(ordUser);
const getRecentUser: (id: number) => User = getUser(recentUserSemigroup);

// get the current User
const currentUserSemigroup: Semigroup<User> = Se.first<User>();
const getCurrentUser: (id: number) => User = getUser(currentUserSemigroup);

assert.deepStrictEqual(getLeastUser(1), {
  id: 1,
  name: 'levin',
  createAt: Date.parse('1977-02-25'),
});

assert.deepStrictEqual(getRecentUser(1), {
  id: 1,
  name: 'levin',
  createAt: Date.parse('2100-03-14'),
});

assert.deepStrictEqual(getCurrentUser(1), {
  id: 1,
  name: 'levin',
  createAt: Date.parse('2022-08-20'),
});
