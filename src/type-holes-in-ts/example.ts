//
// Helper
//

declare function _<T>(): T;

//
// Example 1
//

namespace S0 {
  declare function jonk<A, B>(
    ab: (a: A) => B,
    ann: (an: (a: A) => number) => number
  ): (bn: (b: B) => number) => number;
}

namespace S1 {
  function jonk<A, B>(
    ab: (a: A) => B,
    ann: (an: (a: A) => number) => number
  ): (bn: (b: B) => number) => number {
    return _();
  }
}

namespace S2 {
  function jonk<A, B>(
    ab: (a: A) => B,
    ann: (an: (a: A) => number) => number
  ): (bn: (b: B) => number) => number {
    return (bn) => _();
  }
}

namespace S3 {
  function jonk<A, B>(
    ab: (a: A) => B,
    ann: (an: (a: A) => number) => number
  ): (bn: (b: B) => number) => number {
    return (bn) => ann(_());
  }
}

namespace S4 {
  function jonk<A, B>(
    ab: (a: A) => B,
    ann: (an: (a: A) => number) => number
  ): (bn: (b: B) => number) => number {
    return (bn) => ann((a) => _());
  }
}

namespace S5 {
  function jonk<A, B>(
    ab: (a: A) => B,
    ann: (an: (a: A) => number) => number
  ): (bn: (b: B) => number) => number {
    return (bn) => ann((a) => bn(_()));
  }
}

namespace S6 {
  function jonk<A, B>(
    ab: (a: A) => B,
    ann: (an: (a: A) => number) => number
  ): (bn: (b: B) => number) => number {
    return (bn) => ann((a) => bn(ab(_())));
  }
}

namespace S7 {
  function jonk<A, B>(
    ab: (a: A) => B,
    ann: (an: (a: A) => number) => number
  ): (bn: (b: B) => number) => number {
    return (bn) => ann((a) => bn(ab(a)));
  }
}

//
// Example 2
//

import { foldLeft } from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';

namespace E0 {
  declare function zoop<A, B>(
    abb: (a: A) => (b: B) => B,
    b: B,
    as: Array<A>
  ): B;
}

namespace E0 {
  function zoop<A, B>(abb: (a: A) => (b: B) => B, b: B, as: Array<A>): B {
    return _();
  }
}
