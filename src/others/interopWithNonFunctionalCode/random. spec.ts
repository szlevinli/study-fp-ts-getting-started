import { random } from './random';

it('should be return random number', () => {
  const result1 = random();
  const result2 = random();

  expect(result1).toBe(result2);
});
