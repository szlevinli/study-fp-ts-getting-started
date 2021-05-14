import { Eq as eqBoolean } from 'fp-ts/boolean';
import { log as ioLog } from 'fp-ts/Console';
import { now } from 'fp-ts/Date';
import { Eq } from 'fp-ts/Eq';
import { pipe } from 'fp-ts/function';
import { of as ioOf } from 'fp-ts/IO';
import { Eq as eqNumber, MonoidSum } from 'fp-ts/number';
import * as COMB from './combinator';
import {
  contramap,
  getEq,
  getMonoid,
  printFib,
  replicateIO,
  time,
} from './combinator';

//
// mock
//

jest.mock('fp-ts/Date');
const mockNow = now as jest.MockedFunction<typeof now>;

jest.mock('fp-ts/Console');
const mockIoLog = ioLog as jest.MockedFunction<typeof ioLog>;

//
// test
//

it('[getEq] Eq<number> to Eq<ReadonlyArray<number>>', () => {
  const result = getEq(eqNumber);

  expect(result.equals([1, 2, 3], [1, 2, 3])).toBeTruthy();
  expect(result.equals([1, 2, 3], [2, 1, 3])).toBeFalsy();
});

it('[contramap] Eq<number> to Eq<boolean>', () => {
  const eq = contramap<boolean, number>((x) => x >= 10)(eqBoolean);

  expect(eq.equals(11, 12)).toBeTruthy();
  expect(eq.equals(9, 12)).toBeFalsy();
  expect(eq.equals(5, 6)).toBeTruthy();
});

it('[contramap] Eq<number> to Eq<User>', () => {
  type User = {
    id: number;
    name: string;
  };

  const eqUser: Eq<User> = pipe(
    eqNumber,
    contramap((user: User) => user.id)
  );

  const user1 = { id: 1, name: 'levin' };
  const user2 = { id: 1, name: 'jack' };
  const user3 = { id: 3, name: 'emma' };

  expect(eqUser.equals(user1, user2)).toBeTruthy();
  expect(eqUser.equals(user1, user3)).toBeFalsy();
});

it('[getMonoid] Monoid<number> to Monoid<IO<number>>', () => {
  const ioA = ioOf(5);
  const ioB = ioOf(5);

  const ioMonoid = getMonoid(MonoidSum);
  const result = ioMonoid.concat(ioA, ioB)();

  expect(result).toBe(10);
});

it('打印三次随机菲波那切数列值', () => {
  const fibs: number[] = [];
  const spyLog = jest.spyOn(COMB, 'log');
  const spyFib = jest.spyOn(COMB, 'fibonacci');
  spyLog.mockImplementation((msg: number) => () => {
    fibs.push(msg);
  });
  spyFib.mockImplementation(() => 1);

  const times = 3;

  pipe(printFib, pipe(times, replicateIO))();

  expect(fibs.length).toBe(times);
  expect(fibs).toEqual([...Array(times)].map(() => 1));
});

it('[time] 可以获取执行动作所消耗的时间', () => {
  const fibs: number[] = [];
  const spyLog = jest.spyOn(COMB, 'log');
  const spyFib = jest.spyOn(COMB, 'fibonacci');
  spyLog.mockImplementation((msg: number) => () => {
    fibs.push(msg);
  });
  spyFib.mockImplementation(() => 1);

  mockNow.mockImplementationOnce(() => 0).mockImplementationOnce(() => 10);
  let logResult = '';
  mockIoLog.mockImplementation((msg) => () => {
    logResult = String(msg);
  });

  const times = 3;
  time(pipe(printFib, pipe(times, replicateIO)))();

  expect(fibs.length).toBe(times);
  expect(fibs).toEqual([...Array(times)].map(() => 1));
  expect(logResult).toMatch(/10/gi);
});
