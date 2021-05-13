const a = 1839567234;
const m = 8239451023;
const c = 972348567;

export const random = (seed: number): number => (a * seed + c) % m;

export const randomInRange = (
  seed: number,
  min: number,
  max: number
): [number, number] => {
  const nextSeed = random(seed);
  const random_ = min + Math.floor((nextSeed / m) * (max - min));
  return [nextSeed, random_];
};
