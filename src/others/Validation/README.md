# Either vs. Validation

## The problem

使用 `Either` 无法一次性的将错误返回给用户, 从而降低用户的 UX, 因此为了解决这一通用问题, `fp-ts` 提供了 `Validation`.

> `Validation` 已被 `fp-ts` 废弃, 目前使用 `Either` 包中的 `getAltValidation` 和 `getApplicativeValidation`.

## Either

假设我们需要验证两个字段: `username` 和 `password`, 他们遵循下列规则:

- `username` must not be empty
- `username` can't have dashes in it
- `password` needs to have at least 6 characters
- `password` needs to have at least one capital letter
- `password` needs to have at least one number
