import { Option, none, some } from 'fp-ts/Option';

//
// NonEmptyString
//

export interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol;
}

export type NonEmptyString = string & NonEmptyStringBrand;

const isNonEmptyString = (s: string): s is NonEmptyString => s.length > 0;

export const makeNonEmptyString = (s: string): Option<NonEmptyString> =>
  isNonEmptyString(s) ? some(s) : none;

//
// Int
//

export interface IntBrand {
  readonly Int: unique symbol;
}

export type Int = number & IntBrand;

const isInt = (n: number): n is Int => Number.isInteger(n) && n >= 0;

export const makeInt = (n: number): Option<Int> => (isInt(n) ? some(n) : none);

//
// Usage
//

export interface Person {
  name: NonEmptyString;
  age: Int;
}

export const person = (name: NonEmptyString, age: Int): Person => ({
  name,
  age,
});
