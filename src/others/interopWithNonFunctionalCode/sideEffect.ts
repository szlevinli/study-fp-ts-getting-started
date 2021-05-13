// Use case: an API that reads and/or writes to a global state.
// Example: `localStorage.getItem`
// Solution: `IO`

import { IO } from 'fp-ts/IO';
import { IOEither, tryCatch } from 'fp-ts/IOEither';
import { fromNullable, Option } from 'fp-ts/Option';
import { TaskEither, tryCatch as tryCatchTask } from 'fp-ts/TaskEither';
import fs from 'fs';

export const localStorage = {
  getItem: (key: string) => key,
};

export const getItem = (key: string): IO<Option<string>> => () =>
  fromNullable(localStorage.getItem(key));

// Use case: an API that reads and/or writes to a global state and may throw.
// Example: `readFileSync`
// Solution: `IOEither`, `tryCatch`

export const readFileSync = (path: string): IOEither<Error, string> =>
  tryCatch(
    () => fs.readFileSync(path, 'utf-8'),
    (reason) => new Error(String(reason))
  );

// Use case: an API that performs an asynchronous computation and may reject.
// Example: `fetch`
// Solution: `TaskEither`, `tryCatch`

export const get = (url: string): TaskEither<Error, string> =>
  tryCatchTask(
    () => fetch(url).then((res) => res.text()),
    (reason) => new Error(String(reason))
  );
