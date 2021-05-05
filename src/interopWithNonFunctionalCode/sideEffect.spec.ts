import { getItem, localStorage } from './sideEffect';
import { isNone, isSome } from 'fp-ts/Option';

const mockLocalStorageGetItem = jest.fn();
localStorage['getItem'] = mockLocalStorageGetItem;

beforeEach(() => {
  mockLocalStorageGetItem.mockClear();
});

it('should be return Some', () => {
  mockLocalStorageGetItem.mockReturnValue('hello');
  const result = getItem('h')();

  expect(isSome(result)).toBeTruthy();
});

it('should be return None', () => {
  mockLocalStorageGetItem.mockReturnValue(null);
  const result = getItem('h')();

  expect(isNone(result)).toBeTruthy();
});
