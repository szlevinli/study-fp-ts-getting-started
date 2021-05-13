import {
  Random,
  random,
  randomInRange,
  randomInArray,
  randomT,
} from './randomState';
import { inspect } from 'util';
import { string } from 'fp-ts';
import { second } from 'fp-ts/lib/Reader';
import { last } from 'ramda';

const firstNames = ['Paul', 'Nicole', 'Zane', 'Ellie'];
const lastNames = ['Gray', 'Smith', 'Jones', 'Williams'];

it('[random]', () => {
  const first = random(1);
  const second = random(1);

  console.log(`show random:Random<number> execute result: ${inspect(first)}`);

  expect(first).toEqual(second);
});

it('[randomInRange]', () => {
  const seed = 3;
  const min = 0;
  const max = 100;
  const first = randomInRange(min, max)(seed);
  const second = randomInRange(min, max)(seed);

  console.log(`show randomInRange execute result: ${inspect(first)}`);

  expect(first).toEqual(second);
});

it('[randomInArray]', () => {
  const seed = 9;
  const first = randomInArray(firstNames)(seed);
  const second = randomInArray(firstNames)(seed);

  console.log(`show randomInArray execute result: ${inspect(first)}`);

  expect(first).toEqual(second);
});

it('[randomT]', () => {
  const seed = 3;
  const getFullName = ([first, second]: [string, string]) =>
    `${first} ${second}`;
  const randomFirstName = randomInArray(firstNames);
  const randomLastName = randomInArray(lastNames);

  const randomFullName = randomT(
    getFullName,
    randomFirstName,
    randomLastName
  )(seed);
  const randomFullName2 = randomT(
    getFullName,
    randomFirstName,
    randomLastName
  )(seed);

  console.log(`show randomT execute result: ${inspect(randomFullName)}`);

  expect(randomFullName).toEqual(randomFullName2);
});
