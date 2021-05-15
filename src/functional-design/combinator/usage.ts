import { Monad } from 'fp-ts/IO';
import { randomInt } from 'fp-ts/Random';
import { withLogging, fastest } from './generalCombinator';
import { log } from 'fp-ts/Console';

const fib = (n: number): number => (n <= 1 ? 1 : fib(n - 1) + fib(n - 2));

const program = withLogging(Monad.map(randomInt(30, 35), fib));

// program();

const fastestProgram = Monad.chain(fastest(program, [program, program]), (a) =>
  log(`Fastest result is: ${a}`)
);

fastestProgram();
