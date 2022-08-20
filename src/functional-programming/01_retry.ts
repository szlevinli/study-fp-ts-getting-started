/**
 * Abstraction for a mechanism to perform actions repetitively until successful.
 *
 * This module split 3 parts:
 *
 * - the model
 * - primitives
 * - combinator
 *
 */

import { semigroup as Se } from 'fp-ts';

// ----------------------------------------------------------------------------
// model
// ----------------------------------------------------------------------------

export interface RetryStatus {
  /** Iteration number, where `0` is the first try */
  readonly iterNumber: number;

  /** Latest attemper's delay. Will be always `undefined` on first run. */
  readonly previousDelay: number | undefined;
}

export const startStatus: RetryStatus = {
  iterNumber: 0,
  previousDelay: undefined,
};

/**
 * A `RetryPolicy` is a function that takes an `RetryStatus` and
 * possibly returns a delay in milliseconds. Iteration numbers start
 * at zero and increase by one on each retry. A *undefined* return value from
 * the function implies we have reached the retry limited.
 */
export interface RetryPolicy {
  (status: RetryStatus): number | undefined;
}

// ----------------------------------------------------------------------------
// primitives
// ----------------------------------------------------------------------------

/**
 * constant delay with unlimited retries.
 */
export const constantDelay =
  (delay: number): RetryPolicy =>
  () =>
    delay;

/**
 * Retry immediately, but only up to `i` times.
 */
export const limitRetry =
  (i: number): RetryPolicy =>
  (status) =>
    status.iterNumber >= i ? undefined : 0;

/**
 * Grow delay exponentially each iteration.
 * Each delay will increase by a factor of two.
 */
export const exponentialBackOff =
  (delay: number): RetryPolicy =>
  (status) =>
    delay * Math.pow(2, status.iterNumber);

// ----------------------------------------------------------------------------
// combinator
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// instances
// ----------------------------------------------------------------------------

const semigroupRetryPolicy: Se.Semigroup<RetryPolicy> = {
  concat: (x, y) => (status) => {
    const resultX = x(status);
    const resultY = y(status);
    if (resultX !== undefined && resultY !== undefined) {
      return Math.max(resultX, resultY);
    }
    return undefined;
  },
};
