import { taskEither as TE, function as F, task as T } from 'fp-ts';
import util from 'util';

const getAccessToken = () => Promise.resolve('access token');
const getUser = (token: string) => Promise.resolve({ sub: 'test|001' });
const getUserMeta = (id: string) => Promise.reject(`${id} no exists`);
const getUserInfo = () => Promise.reject('get use info fail');

const teGetAccessToken = () =>
  TE.tryCatch(
    () => getAccessToken(),
    (reason) => String(reason)
  );

const teGetUser = (token: string) =>
  TE.tryCatch(
    () => getUser(token),
    (reason) => String(reason)
  );

const teGetUserMeta = ({ sub }: { sub: string }) =>
  TE.tryCatch(
    () => getUserMeta(sub),
    (reason) => new Error(String(reason))
  );

const teGetUserInfo = () =>
  TE.tryCatch(
    () => getUserInfo(),
    (reason) => new Error(String(reason))
  );

const pipeLine = F.pipe(
  teGetAccessToken(),
  TE.chainW(teGetUser),
  TE.chainW(teGetUserMeta),
  TE.chainW(teGetUserInfo)
);

pipeLine().then((data) => {
  console.log(`data:${util.inspect(data)}`);
});
