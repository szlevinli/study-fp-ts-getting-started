export const fib = (n: number): number =>
  n <= 1 ? 1 : fib(n - 1) + fib(n - 2);

// tail recursion version
const fibonacci_ =
  (ac1: number) =>
  (ac2: number) =>
  (n: number): number =>
    n <= 1 ? ac2 : fibonacci_(ac2)(ac1 + ac2)(n - 1);

export const fibonacci = fibonacci_(1)(1);
