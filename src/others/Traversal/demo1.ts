import { pipe, flow } from 'fp-ts/function';
import I from 'fp-ts/Identity';
import O from 'fp-ts/Option';
import TE from 'fp-ts/TaskEither';
import E from 'fp-ts/Either';
import A from 'fp-ts/Array';
import { sequenceS, sequenceT } from 'fp-ts/Apply';
import { values } from 'ramda';
import { reverse } from 'fp-ts/Ord';
import { Ord } from 'fp-ts/string';
import { collect } from 'fp-ts/Record';

// ----------------------------------------------------------------------------
// 使用 chainFirst 功能将一个入参分发到多个函数中
// 这里使用 Identity 类型来处理 plain function
// ----------------------------------------------------------------------------

type DataFrame = {
  name: string;
};

declare const setDf: (df: O.Option<DataFrame>) => void;
declare const setDf2: (df: O.Option<DataFrame>) => void;
declare const df: DataFrame;

const r2 = pipe(df, O.some, I.chainFirst(setDf), I.chainFirst(setDf2));

const r3 = flow(O.some, I.chainFirst(setDf), I.chainFirst(setDf2));
export const r3_ = r3(df);

// ----------------------------------------------------------------------------
// Sequences:
//
// Array<Option<A>> => Option<Array<A>>
//
// 要实现上面的功能, 必须提供 sequence an instance of `Applicative`.
// `Applicative` 有三个方法: `of`, `map` and `ap`
// ----------------------------------------------------------------------------

const arr = [1, 2, 3].map(O.of);
// arrR0 :: Option<readonly number[]>
const arrR0 = O.sequenceArray(arr);

// ----------------------------------------------------------------------------
// SequenceT
// ----------------------------------------------------------------------------

declare function foo(a: number, b: string): boolean;
declare function bar(a: boolean): object;

// r1 :: Option<object>
const r1 = pipe(
  // Option<[number, string]>
  sequenceT(O.Apply)(O.of(123), O.of('asdf')),
  O.map((args) => foo(...args)),
  O.map(bar)
);

// ----------------------------------------------------------------------------
// SequenceS
// ----------------------------------------------------------------------------

type RegisterInput = {
  email: string;
  password: string;
};

declare function validateEmail(email: string): E.Either<Error, string>;
declare function validatePassword(password: string): E.Either<Error, string>;
declare function register(input: RegisterInput): unknown;

declare const input: RegisterInput;

const r10 = pipe(
  input,
  ({ email, password }) =>
    // Either<Error, {email: string; password: string}>
    sequenceS(E.Applicative)({
      email: validateEmail(email),
      password: validatePassword(password),
    }),
  E.map(register)
);

// ----------------------------------------------------------------------------
// Traversals
// ----------------------------------------------------------------------------

declare const getPartIds: () => TE.TaskEither<Error, string[]>;
declare const getPart: (partId: string) => TE.TaskEither<Error, Blob>;

// result :: TaskEither<Error, readonly Blob[]>
const result = pipe(getPartIds(), TE.chain(TE.traverseArray(getPart)));
