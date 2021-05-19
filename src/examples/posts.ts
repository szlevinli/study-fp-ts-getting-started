import {
  array as Ary,
  function as Fun,
  io as IO,
  ord as Ord,
  string as Str,
  task as T,
} from 'fp-ts';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import R from 'ramda';
import remark from 'remark';
import html from 'remark-html';
import { inspect } from 'util';
import { VFile } from 'vfile';

export type PostsData = matter.GrayMatterFile<string> & { id: string };

//
// defined
//

const getCwd = IO.of(process.cwd());

const getFileName = (ext: RegExp) => (fileName: string) =>
  IO.of(fileName.replace(ext, ''));
const getFileNameForMdFile = getFileName(/\.md$/);

const getFullPath = (dirPath: string) => (filePath: string) =>
  IO.of(path.join(dirPath, filePath));

const getFileNamesOfDir = (dir: string) => IO.of(fs.readdirSync(dir));

const getFileContents = (file: string) => IO.of(fs.readFileSync(file, 'utf-8'));

const getMatter = (fileContent: string) => IO.of(matter(fileContent));

const sortByDate = Fun.pipe(
  Str.Ord,
  Ord.reverse,
  Ord.contramap((p: PostsData) => p.data.date)
);

//
// usage
//

// const getFullPathForPosts = getFullPath(process.cwd())('posts');
const getFullPathForPosts = Fun.pipe(
  getCwd,
  IO.map(getFullPath),
  IO.flap('posts'),
  IO.flatten
);

const getFullPathFileNameForPosts = (fileName: string) =>
  Fun.pipe(
    getFullPathForPosts,
    IO.map(getFullPath),
    IO.flap(fileName),
    IO.flatten
  );

const fileNameToMatter = (fileName: string): IO.IO<PostsData> =>
  Fun.pipe(
    getFullPathFileNameForPosts(fileName),
    IO.chain(getFileContents),
    IO.chain(getMatter),
    IO.apS('id', getFileNameForMdFile(fileName))
  );

const getFileNamesForPosts = Fun.pipe(
  getFullPathForPosts,
  IO.chain(getFileNamesOfDir)
);

const fileNameToId = (fileName: string) =>
  Fun.pipe(
    IO.Do,
    IO.bind('id', () => getFileNameForMdFile(fileName)),
    IO.bindTo('params')
  );

const md2Html =
  (md: string): T.Task<VFile> =>
  () =>
    remark().use(html).process(md);

//
// exports
//

export const getSortedPostsData = Fun.pipe(
  getFileNamesForPosts,
  IO.chain(IO.traverseArray(fileNameToMatter)),
  IO.map(Ary.sort(sortByDate))
);

// ----------------------------------------------------------------------------
console.log(`getSortedPostsData: ${inspect(getSortedPostsData())}`);
// ----------------------------------------------------------------------------

export const getAllPostIds: IO.IO<
  readonly { params: { readonly id: string } }[]
> = Fun.pipe(getFileNamesForPosts, IO.chain(IO.traverseArray(fileNameToId)));

// ----------------------------------------------------------------------------
console.log(`getAllPostIds: ${inspect(getAllPostIds())}`);
// ----------------------------------------------------------------------------

const getPostDataIO = (id: string) =>
  Fun.pipe(
    getFullPathFileNameForPosts(`${id}.md`),
    IO.chain(getFileContents),
    IO.chain(getMatter),
    IO.map(R.objOf('matter')),
    IO.bind('data', ({ matter }) => IO.of(matter.data)),
    IO.bind('id', () => IO.of(id)),
    T.fromIO,
    T.bind('contentHtml', ({ matter }) =>
      Fun.pipe(matter.content, md2Html, T.map(String))
    ),
    T.map(R.omit(['matter']))
  );

export const getPostData = (id: string) => getPostDataIO(id)();

// ----------------------------------------------------------------------------
getPostData('ssg-ssr').then((s) =>
  console.log(`getPostData('ssg-ssr'): ${inspect(s)}`)
);
// ----------------------------------------------------------------------------
