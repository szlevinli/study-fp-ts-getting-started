import { log } from 'fp-ts/Console';
import { IO, Applicative as applicativeIO, chain as chainIO } from 'fp-ts/IO';
import { Monoid, concatAll, monoidVoid } from 'fp-ts/Monoid';
import { getApplicativeMonoid } from 'fp-ts/Applicative';
import { MonoidSum } from 'fp-ts/number';
import { randomInt } from 'fp-ts/Random';
import { pipe, flip } from 'fp-ts/function';
import { replicate } from 'fp-ts/ReadonlyArray';

const getMonoidIO = <A>(ma: Monoid<A>) =>
  getApplicativeMonoid(applicativeIO)(ma);

const replicateIO = (n: number) => (iv: IO<void>) =>
  concatAll(getMonoidIO(monoidVoid))(replicate(n, iv));

type Die = IO<number>;

const monoidDie: Monoid<Die> = getApplicativeMonoid(applicativeIO)(MonoidSum);

const roll = (dice: Array<Die>): Die => concatAll(monoidDie)(dice);

const d6: Die = randomInt(1, 6);

const dice = [d6, d6, d6];

const program = pipe(dice, roll, chainIO(log));

const startRoll = (n: number) => replicateIO(3)(program)();

startRoll(3);
