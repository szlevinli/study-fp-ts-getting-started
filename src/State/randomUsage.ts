import { randomInRange } from './random';

// ----------------------------------------------------------------------------
// Usage 1: 从数组中随机挑选元素
// ----------------------------------------------------------------------------

export const randomInArray = <A>(seed: number, as: Array<A>): [number, A] => {
  const [nextSeed, ranged] = randomInRange(seed, 0, as.length);
  return [nextSeed, as[ranged]];
};

const firstNames = ['Paul', 'Nicole', 'Zane', 'Ellie'];
const [seed, firstName] = randomInArray(2, firstNames);
const [seed2, firstName2] = randomInArray(seed, firstNames);
const [seed3, firstName3] = randomInArray(seed2, firstNames);

console.log(`seed=${seed}, firstName=${firstName}`);
console.log(`seed=${seed2}, firstName=${firstName2}`);
console.log(`seed=${seed3}, firstName=${firstName3}`);
