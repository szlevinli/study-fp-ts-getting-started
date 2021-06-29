# Smart Constructor

## The Problem

```typescript
interface Person {
  name: string
  age: number
}

function person(name: string, age: number): Person {
  return { name, age }
}

const p = person('', -1.2) // no error
```

As you can see, `string` and `number` are broad types. How can I define a non empty string? Or positive numbers? Or integers? Or positive integers?

More generally:

> **How can I define a _refinement_ of a type `T`?**

## The recipe

1. define a type `R` which represents the refinement
2. do **not** export a constructor for `R`
3. do export a function (the **smart constructor**) with the following signature

    ```typescript
    make: (t: T) => Option<R>
    ```

## A possible implementation: branded types

A **branded type** is a type `T` intersected with a *unique* brand.

```typescript
type BrandedT = T & Brand
```

Let's implement `NonEmptyString`

1. define a type `NonEmptyString` which represents refinement

    ```typescript
    export interface NonEmptyStringBrand {
      readonly NonEmptyString: unique symbol;
    }

    export type NonEmptyString = string & NonEmptyStringBrand;
    ```

    > 上面这段类型定义的目的: 无法绕过类型构造器来给这种类型的变量赋值. 即 `const name: NonEmptyString = ?` 无论什么类型的数据都无法直接赋值给 `name`, 只能通过下面的构造器来创建值.

2. do export a smart constructor `make: (t: T) => Option<R>`, in case the `t` is `string` and `R` is `NonEmptyString`

    ```typescript
    export const makeNonEmptyString = (s: string): Option<NonEmptyString> =>
      isNonEmptyString(s) ? some(s) : none;
    ```

Let's implement `Int`

```typescript
export interface IntBrand {
  readonly Int: unique symbol;
}

export type Int = number & IntBrand;

const isInt = (n: number): n is Int => Number.isInteger(n) && n >= 0;

export const makeInt = (n: number): Option<Int> => (isInt(n) ? some(n) : none);
```

## 解决问题

现在我们来解决之前提出的问题

```typescript
export interface Person {
  name: NonEmptyString;
  age: Int;
}

export const person = (name: NonEmptyString, age: Int): Person => ({
  name,
  age,
});
```

这样一来我们无法使用 `person('', -1.2)` 语句, Typescript 静态类型检查会报错. 现在需要使用如下方式来创建 `person` 对象

```typescript
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { makeInt, makeNonEmptyString, person } from './smartConstructor';

it('should be create instance of `Person`', () => {
  const myName = makeNonEmptyString('levin');
  const myAge = makeInt(18);
  const levin = O.Monad.chain(myName, (name) =>
    O.Functor.map(myAge, (age) => person(name, age))
  );

  expect(O.isSome(levin)).toBeTruthy();
  expect(
    pipe(
      levin,
      O.getOrElseW(() => null)
    )
  ).toEqual({
    name: 'levin',
    age: 18,
  });
});

it('should be create `None`', () => {
  const myName = makeNonEmptyString('levin');
  const myAge = makeInt(-18);
  const levin = O.Monad.chain(myName, (name) =>
    O.Functor.map(myAge, (age) => person(name, age))
  );

  expect(O.isNone(levin)).toBeTruthy();
  expect(
    pipe(
      levin,
      O.getOrElseW(() => null)
    )
  ).toBeNull();
});
```
