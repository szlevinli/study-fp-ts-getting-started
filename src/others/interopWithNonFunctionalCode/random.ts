// Use case: an API that return a non deterministic value.
// Example: `Math.random`
// Solution: `IO`

import { IO } from 'fp-ts/IO';

export const random: IO<number> = () => Math.random();

// 这个函数乍一看仿佛没什么特别, 但实际上无论你调用这个函数多少次, 他都返回一样的值
// 都返回一样的值的随机函数有什么用? 我们可以略一修改比如传入一个 seed 值就可实现
// 伪随机了.
