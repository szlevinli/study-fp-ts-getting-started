import { State, map, chain, Apply as stateApply } from 'fp-ts/State';
import { pipe } from 'fp-ts/function';
import { sequenceT } from 'fp-ts/Apply';

const a = 1839567234;
const m = 8239451023;
const c = 972348567;

export type Random<A> = State<number, A>;

export const random: Random<number> = (seed) => {
  const nextSeed = (a * seed + c) % m;
  return [nextSeed, nextSeed];
};

// ----------------------------------------------------------------------------
// map
// ----------------------------------------------------------------------------

export const randomInRange = (max: number, min: number): Random<number> => {
  const inRange = (num: number) => min + Math.floor((num / m) * (max - min));
  return map(inRange)(random);
};

export const randomInArray = <A>(as: Array<A>): Random<A> =>
  pipe(
    randomInRange(0, as.length),
    map((index) => as[index])
  );

export const randomBoolean: Random<boolean> = pipe(
  randomInRange(0, 1),
  map((n) => n === 1)
);

// 仿写 State map
export const mapImitate: <A, B>(
  f: (a: A) => B
) => <E>(fa: State<E, A>) => State<E, B> = (f) => (generate) => (seed) => {
  // `f` type is `(a: A) => B`
  // `generate` type is `State<E, A> = (s: E) => [A, E]`
  // `seed` type is `E`
  const [a, nextSeed] = generate(seed);
  return [f(a), nextSeed];
};

// ----------------------------------------------------------------------------
// composition
// ----------------------------------------------------------------------------

export const randomT = <A, B>(
  f: ([first, second]: [A, A]) => B,
  a: Random<A>,
  b: Random<A>
) => pipe(sequenceT(stateApply)(a, b), map(f));

// ----------------------------------------------------------------------------
// chain
// ----------------------------------------------------------------------------

export const randomBooleanChain = <A>(a: Random<A>, b: Random<A>): Random<A> =>
  pipe(
    randomBoolean,
    chain((bool) => (bool ? a : b))
  );

// 仿写 State chain
export const chainImitate: <S, A, B>(
  f: (a: A) => State<S, B>
) => (fa: State<S, A>) => State<S, B> = (f) => (generate) => (seed) => {
  // `f` type is `(a: A) => State<S, B>`
  // `generate` type is `(s: S) => [A, S]`
  // `seed` type is S
  const [a, nextSeed] = generate(seed);
  const [b, nextSeed2] = f(a)(nextSeed);
  return [b, nextSeed2];
};
