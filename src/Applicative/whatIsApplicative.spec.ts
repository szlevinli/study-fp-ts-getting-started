import { applicativeArray, applicativeOption } from './whatIsApplicative';
import { some, ap as optionAp } from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { ap as arrayAp } from 'fp-ts/Array';
import { of as taskOf, ap as taskAp } from 'fp-ts/Task';

it('[applicativeArray.ap] ', () => {
  const f = (a: string) => (b: number) => (c: boolean) =>
    a + String(b) + String(c);
  const fa = ['a', 'b'];
  const fb = [1, 2, 3];
  const fc = [true];

  /**
   * 下面的代码除了解释 ap 的用法外, 还非常好的解释了 curry 化的用途.
   *
   * `result1`: pipe 组合方式, arrayAp 是 fp-ts/Array 提供的方法
   * 能够应用到 pipe, 表明 arrayAp 是 curry 化后的.
   *
   * `result2`: 通过自定义的 ap 函数(`applicativeArray.ap`)会发现用起来
   * 比较复杂, 而且不好理解.
   */

  const result1 = pipe([f], arrayAp(fa), arrayAp(fb), arrayAp(fc));
  const result2 = applicativeArray.ap(
    applicativeArray.ap(applicativeArray.ap([f], fa), fb),
    fc
  );

  expect(result1).toEqual([
    'a1true',
    'a2true',
    'a3true',
    'b1true',
    'b2true',
    'b3true',
  ]);

  expect(result2).toEqual([
    'a1true',
    'a2true',
    'a3true',
    'b1true',
    'b2true',
    'b3true',
  ]);
});

it('[applicativeOption.ap]', () => {
  const f = (a: string) => (b: number) => (c: boolean) =>
    a + String(b) + String(c);
  const fa = some('a');
  const fb = some(1);
  const fc = some(false);

  const result = pipe(some(f), optionAp(fa), optionAp(fb), optionAp(fc));

  expect(result).toEqual(some('a1false'));
});

it('[applicativeTask.ap]', async () => {
  const f = (a: string) => (b: number) => (c: boolean) =>
    a + String(b) + String(c);
  const fa = taskOf('a');
  const fb = taskOf(1);
  const fc = taskOf(true);

  const result = await pipe(taskOf(f), taskAp(fa), taskAp(fb), taskAp(fc))();

  expect(result).toEqual('a1true');
});
