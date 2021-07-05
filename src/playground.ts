import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { inspect } from 'util';

const first = pipe(
  true,
  E.fromPredicate(
    (a) => a,
    (a) => 'first error'
  )
);

const firstE = pipe(
  false,
  E.fromPredicate(
    (a) => a,
    (a) => 'first error'
  )
);

const second = E.right('second');

const secondE = E.left('second error');

const result = pipe(
  firstE,
  E.chainFirst((a) => second)
);

console.log(`
first second: ${inspect(
  pipe(
    first,
    E.chainFirst(() => second)
  )
)}

first secondE: ${inspect(
  pipe(
    first,
    E.chainFirst(() => secondE)
  )
)}

firstE second: ${inspect(
  pipe(
    firstE,
    E.chainFirst(() => second)
  )
)}

firstE secondE: ${inspect(
  pipe(
    firstE,
    E.chainFirst(() => secondE)
  )
)}
`);
