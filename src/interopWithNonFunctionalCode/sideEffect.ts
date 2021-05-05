// Use case: an API that reads and/or writes to a global state.
// Example: `localStorage.getItem`
// Solution: `IO`

import { Option, fromNullable } from 'fp-ts/Option';
import { IO } from 'fp-ts/IO';

export const localStorage = {
  getItem: (key: string) => key,
};

export const getItem = (key: string): IO<Option<string>> => () =>
  fromNullable(localStorage.getItem(key));
