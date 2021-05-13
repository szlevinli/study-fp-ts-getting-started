import { getItem, localStorage, readFileSync, get } from './sideEffect';
import { isNone, isSome } from 'fp-ts/Option';
import { isLeft, isRight, getOrElse } from 'fp-ts/Either';
import fs from 'fs';

const mockLocalStorageGetItem = jest.fn();
localStorage['getItem'] = mockLocalStorageGetItem;

jest.mock('fs');
const mockFsReadFileSync = fs.readFileSync as jest.MockedFunction<
  typeof fs.readFileSync
>;

const mockFetch = jest.fn();
global.fetch = mockFetch;

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

it('should be read file', () => {
  const fileContent = 'something...';
  mockFsReadFileSync.mockReturnValue(fileContent);
  const result = readFileSync('file.txt')();

  expect(isRight(result)).toBeTruthy();
  expect(getOrElse(() => '')(result)).toBe(fileContent);
});

it('should be throw when read file', () => {
  const reason = 'file not found';
  mockFsReadFileSync.mockImplementation(() => {
    throw new Error(reason);
  });
  const result = readFileSync('file.txt')();

  expect(isLeft(result)).toBeTruthy();
  expect(getOrElse(() => '')(result)).toBe('');
});

it('should be fetch resolve', async () => {
  mockFetch.mockResolvedValue({ text: () => 'hello' });
  const result = await get('url')();

  expect(isRight(result)).toBeTruthy();
});

it('should be fetch reject', async () => {
  mockFetch.mockRejectedValue('some error');
  const result = await get('url')();

  expect(isLeft(result)).toBeTruthy();
});
