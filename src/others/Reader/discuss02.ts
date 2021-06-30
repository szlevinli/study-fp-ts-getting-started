import { flow, pipe } from 'fp-ts/function';
import { always, equals, ifElse } from 'ramda';
import * as R from 'fp-ts/Reader';

export interface Dependencies {
  readonly i18n: {
    readonly true: string;
    readonly false: string;
  };
  readonly lowerBound: number;
}

export interface OtherDependencies {
  readonly semicolon: boolean;
}

// Transform:
const transform = (a: string) => (deps: OtherDependencies) =>
  `myString${deps.semicolon ? ':' : ''} ${a}`;

const transform2 = (deps: OtherDependencies) => (a: string) =>
  `myString${deps.semicolon ? ':' : ''} ${a}`;

// AnotherTransform:
const anotherTransform = (a: string) => (deps: OtherDependencies) =>
  `${a}${deps.semicolon ? ':' : ''} myString`;

const anotherTransform2 = (deps: OtherDependencies) => (a: string) =>
  `${a}${deps.semicolon ? ':' : ''} myString`;

// F:
const f = (b: boolean) => (deps: Dependencies) =>
  pipe(
    b,
    ifElse(equals(true), always(deps.i18n.true), always(deps.i18n.false))
  );

const f2 = (deps: Dependencies) =>
  ifElse(equals(true), always(deps.i18n.true), always(deps.i18n.false));

// G:
const g = (n: number) => (deps: Dependencies & OtherDependencies) =>
  pipe(
    n > 2,
    f,
    (ff) => ff(deps),
    (s) => transform(s)(deps),
    (s) => anotherTransform(s)(deps)
  );

const g2 = (deps: Dependencies & OtherDependencies) =>
  flow(
    (n: number) => n > 2,
    f2(deps),
    transform2(deps),
    anotherTransform2(deps)
  );

namespace Giulio {
  export interface Dependencies {
    readonly i18n: {
      readonly true: string;
      readonly false: string;
    };
    readonly lowerBound: number;
  }

  export interface OtherDependencies {
    readonly semicolon: boolean;
  }

  declare function transform(a: string): R.Reader<OtherDependencies, string>;
  declare function anotherTransform(
    a: string
  ): R.Reader<OtherDependencies, string>;
  declare function f(b: boolean): R.Reader<Dependencies, string>;

  export const g = (n: number) =>
    pipe(f(n > 2), R.chainW(transform), R.chainW(anotherTransform));
}
