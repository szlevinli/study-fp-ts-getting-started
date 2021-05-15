import { validatePassword, validatePasswordV } from './validation';

console.log(validatePassword('ab'));

console.log(validatePassword('abcdef'));

console.log(validatePassword('Aabcdef'));

console.log(validatePasswordV('abcdef'));
