import { option, some } from './Option';

it('should be run', () => {
  const double = (n: number) => n * 2;

  const result = option.map(double, some(1));

  expect(result).toEqual(some(2));
});
