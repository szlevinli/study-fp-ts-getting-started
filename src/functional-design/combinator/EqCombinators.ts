import { strict as assert } from 'assert';
import { Eq as EqBoolean } from 'fp-ts/boolean';
import { struct } from 'fp-ts/Eq';
import { Eq as EqNumber } from 'fp-ts/number';
import { Eq as EqString } from 'fp-ts/string';

/**
 * Eq 中的 combinator 有两个: struct 和 tuple
 *
 * - struct 用于构建基于结构类型(在 js 中就是 object)的数据比较
 * - tuple 同理用于构建基于 tuple 数据类型的比较
 *
 */

/**
 * 比如: 我们有一个对象 Person, 它的 type 是
 * {
 *   name: string;
 *   age: number;
 *   isMarried: boolean;
 * }
 * 如果我们要实现 Person 的比较, 可以用 struct 函数来方便的构建
 */

type Person = {
  name: string;
  age: number;
  isMarried: boolean;
};

const EqPerson = struct<Person>({
  name: EqString,
  age: EqNumber,
  isMarried: EqBoolean,
});

assert.deepEqual(
  EqPerson.equals(
    { name: 'levin', age: 18, isMarried: false },
    { name: 'levin', age: 18, isMarried: false }
  ),
  true
);
assert.deepEqual(
  EqPerson.equals(
    { name: 'levin', age: 18, isMarried: false },
    { name: 'emma', age: 10, isMarried: false }
  ),
  false
);
