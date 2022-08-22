import { string as Str, readonlyArray as RA } from 'fp-ts';
import { Eq, fromEquals } from 'fp-ts/Eq';
import { strict as assert } from 'node:assert';

type Forest<A> = ReadonlyArray<Tree<A>>;

interface Tree<A> {
  readonly value: A;
  readonly forest: Forest<A>;
}

/*
这是个递归
*/
const getEq = <A>(E: Eq<A>): Eq<Tree<A>> => {
  const R: Eq<Tree<A>> = fromEquals(
    (first, second) =>
      E.equals(first.value, second.value) &&
      SA.equals(first.forest, second.forest)
  );
  const SA = RA.getEq(R);
  return R;
};

// ----------------------------------------------------------------------------
// test
// ----------------------------------------------------------------------------

const make = <A>(value: A, forest: Forest<A> = []): Tree<A> => ({
  value,
  forest,
});

const t = make('a', [make('b'), make('c')]);

const E: Eq<Tree<string>> = getEq(Str.Eq);

assert.deepStrictEqual(E.equals(t, make('a')), false);
assert.deepStrictEqual(E.equals(t, make('a', [make('b')])), false);
assert.deepStrictEqual(E.equals(t, make('a', [make('b'), make('d')])), false);
assert.deepStrictEqual(
  E.equals(t, make('a', [make('b'), make('c'), make('d')])),
  false
);
assert.deepStrictEqual(E.equals(t, make('a', [make('b'), make('c')])), true);
