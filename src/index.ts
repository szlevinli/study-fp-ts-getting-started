import R from 'ramda';

const demo = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(100);
  }, 1000);
});

demo.then((v) => console.log(v));
console.log(R.objOf('start', '...'));
