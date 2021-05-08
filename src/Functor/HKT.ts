// 这里 `F` 是 unique identifier 表示 type constructor. `A` 是 type constructor 的 参数
// eg. Option<string> 这里 `Option` 是 `F` 即 type constructor, `string` 是 `A` type constructor 的 参数
export interface HKT<F, A> {
  _URI: F;
  _A: A;
}
