import { Dependencies, h, h1, h2, h3 } from './readerDemo';

const dep: Dependencies = {
  i18n: {
    true: '真',
    false: '假',
  },
  lowerBound: 4,
};

it('should work normally when using the original version', () => {
  const result = h('abc');

  expect(result).toBe('true');
});

it('should work normally when use the first version', () => {
  const result = h1('abc', dep);

  expect(result).toBe('真');
});

it('should work normally when using the second version, aka `Reader`', () => {
  const result = h2('abc');

  expect(result(dep)).toBe('真');
});

it('should work normally when using the third version', () => {
  const result = h3('abc');

  expect(result(dep)).toBe('假');
});
