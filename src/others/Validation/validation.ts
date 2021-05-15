import { sequenceT } from 'fp-ts/Apply';
import {
  chain,
  Either,
  getApplicativeValidation,
  left,
  map,
  mapLeft,
  right,
} from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { getSemigroup, NonEmptyArray } from 'fp-ts/NonEmptyArray';

const validate =
  (f: (s: string) => boolean) =>
  (msg: string) =>
  (str: string): Either<string, string> =>
    f(str) ? right(str) : left(msg);

const minLengthMsg = 'at least 6 characters';
const minLength6 = (s: string) => s.length >= 6;
const minLength6Validation = validate(minLength6)(minLengthMsg);

const oneCapitalMsg = 'at least one capital letter';
const oneCapital = (s: string) => /[A-Z]/g.test(s);
const oneCapitalValidation = validate(oneCapital)(oneCapitalMsg);

const oneNumberMsg = 'at least one number';
const oneNumber = (s: string) => /[0-9]/g.test(s);
const oneNumberValidation = validate(oneNumber)(oneNumberMsg);

export const validatePassword = (s: string): Either<string, string> =>
  pipe(
    minLength6Validation(s),
    chain(oneCapitalValidation),
    chain(oneNumberValidation)
  );

function lift<E, A>(
  check: (a: A) => Either<E, A>
): (a: A) => Either<NonEmptyArray<E>, A> {
  return (a) =>
    pipe(
      check(a),
      mapLeft((a) => [a])
    );
}

const minLength6ValidationV = lift(minLength6Validation);
const oneCapitalValidationV = lift(oneCapitalValidation);
const oneNumberValidationV = lift(oneNumberValidation);

export function validatePasswordV(
  s: string
): Either<NonEmptyArray<string>, string> {
  return pipe(
    sequenceT(getApplicativeValidation(getSemigroup<string>()))(
      minLength6ValidationV(s),
      oneCapitalValidationV(s),
      oneNumberValidationV(s)
    ),
    map(() => s)
  );
}
