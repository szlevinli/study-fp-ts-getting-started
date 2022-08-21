export const __N__ = 0;

interface HKT_C<URI, A> {
  readonly _URI: URI;
  readonly _A: A;
}

interface URItoKind_C<A> {}

type URIS_C = keyof URItoKind_C<any>;

type Kind_C<URI extends URIS_C, A> = URI extends URIS_C ? URItoKind_C<A> : any;

//
// Usage
//

type RRR<A> = {
  name: string;
  body: A;
};

const URI = 'RRR';
type URI = typeof URI;

const x = <A>(a: A): HKT_C<URI, A> => ({
  _URI: 'RRR',
  _A: a,
});
