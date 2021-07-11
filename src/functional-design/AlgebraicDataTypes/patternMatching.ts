type List<A> = { type: 'Nil' } | { type: 'Cons'; head: A; tail: List<A> };

const fold = <A, R>(
  fa: List<A>,
  onNil: () => R,
  onCons: (head: A, tail: List<A>) => R
): R => (fa.type === 'Nil' ? onNil() : onCons(fa.head, fa.tail));

const length2 = <A>(fa: List<A>): number =>
  fold(
    fa,
    () => 0,
    (_, tail) => 1 + length2(tail)
  );
