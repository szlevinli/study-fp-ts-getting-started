import { apply, either as E, nonEmptyArray as Na } from 'fp-ts';
import { pipe } from 'fp-ts/function';

type Check<E, A> = (a: A) => E.Either<E, A>;

const minLength: Check<string, string> = (s) =>
  s.length > 6 ? E.right(s) : E.left('at least 6 characters');

const oneCapital: Check<string, string> = (s) =>
  /[A-Z]/g.test(s) ? E.right(s) : E.left('at least one capital letter');

const oneNumber: Check<string, string> = (s) =>
  /[0-9]/g.test(s) ? E.right(s) : E.left('at least one number');

const lift =
  <E, A>(check: Check<E, A>): Check<Na.NonEmptyArray<E>, A> =>
  (a) =>
    pipe(
      check(a),
      E.mapLeft((e) => [e])
    );

const minLengthV = lift(minLength);
const oneCapitalV = lift(oneCapital);
const oneNumberV = lift(oneNumber);

const validatePassword: Check<Na.NonEmptyArray<string>, string> = (s) =>
  pipe(
    apply.sequenceT(E.getApplicativeValidation(Na.getSemigroup<string>()))(
      minLengthV(s),
      oneCapitalV(s),
      oneNumberV(s)
    ),
    E.map(() => s)
  );
