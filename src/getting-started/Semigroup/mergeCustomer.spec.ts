/* cspell:words giulio canti */
import { semigroupCustomer, Customer } from './mergeCustomer';

it('should be merge', () => {
  const a: Customer = {
    name: 'Giulio',
    favouriteThings: ['math', 'climbing'],
    registeredAt: new Date(2018, 1, 20).getTime(),
    lastUpdatedAt: new Date(2018, 2, 18).getTime(),
    hasMadePurchase: false,
  };
  const b: Customer = {
    name: 'Giulio Canti',
    favouriteThings: ['functional programming'],
    registeredAt: new Date(2018, 1, 22).getTime(),
    lastUpdatedAt: new Date(2018, 2, 9).getTime(),
    hasMadePurchase: true,
  };
  const expectVal: Customer = {
    name: 'Giulio Canti',
    favouriteThings: ['math', 'climbing', 'functional programming'],
    registeredAt: new Date(2018, 1, 20).getTime(),
    lastUpdatedAt: new Date(2018, 2, 18).getTime(),
    hasMadePurchase: true,
  };

  expect(semigroupCustomer.concat(a, b)).toEqual(expectVal);
});
