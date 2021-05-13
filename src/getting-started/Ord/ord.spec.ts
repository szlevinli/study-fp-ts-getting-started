import { ordNumber, User, byAge, byAgeDesc } from './ord';

it('[ordNumber] should be correct execute', () => {
  expect(ordNumber.compare(2, 1)).toEqual(1);
  expect(ordNumber.compare(2, 2)).toEqual(0);
  expect(ordNumber.compare(1, 2)).toEqual(-1);
});

it('[byAge] should be order by age with ascent', () => {
  const levin: User = { name: 'levin', age: 44 };
  const emma: User = { name: 'emma', age: 9 };

  expect(byAge.compare(levin, emma)).toBe(1);
});

it('[byAge] should be order by age with descent', () => {
  const levin: User = { name: 'levin', age: 44 };
  const emma: User = { name: 'emma', age: 9 };

  expect(byAgeDesc.compare(levin, emma)).toBe(-1);
});
