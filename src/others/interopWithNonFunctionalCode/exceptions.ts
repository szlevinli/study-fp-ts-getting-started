// Use case: an API that may throw.
// Example: `JSON.parse`
// Solution: `Either`, `tryCatch`

import { Either, tryCatch } from 'fp-ts/Either';

export const parse = (s: string): Either<Error, unknown> =>
  tryCatch(
    () => JSON.parse(s),
    (reason) => new Error(String(reason))
  );

// `tryCatch`: Constructs a new `Either` from a function that might throw.
//             通过一个可能抛出异常的函数来构建 `Either`
// 上面的例子就是根据 `JSON.parse` 函数来够条件 `Either`
