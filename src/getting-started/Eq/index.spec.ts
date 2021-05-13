import { eqPoint, Point, eqArrayOfPoints, User, eqUser } from './index';

it('should be equals', () => {
  const a: Point = {
    x: 10,
    y: 20,
  };
  const b: Point = {
    x: 10,
    y: 20,
  };

  expect(eqPoint.equals(a, b)).toBeTruthy();
});

it('should be NOT equals', () => {
  const a: Point = {
    x: 10,
    y: 20,
  };
  const b: Point = {
    x: 10,
    y: 2,
  };

  expect(eqPoint.equals(a, b)).toBeFalsy();
});

it('should be equals with `Array`', () => {
  const as: Array<Point> = [
    { x: 1, y: 2 },
    { x: 3, y: 4 },
  ];
  const bs: Array<Point> = [
    { x: 1, y: 2 },
    { x: 3, y: 4 },
  ];

  expect(eqArrayOfPoints.equals(as, bs)).toBeTruthy();
});

it('should be equals with `User` object when `userId` is equals', () => {
  const a: User = {
    userId: 1,
    name: 'levin',
  };
  const b: User = {
    userId: 1,
    name: 'emma',
  };

  expect(eqUser.equals(a, b)).toBeTruthy();
});

it('should be Not equals with `User` object when `userId` is NOT equals', () => {
  const a: User = {
    userId: 1,
    name: 'levin',
  };
  const b: User = {
    userId: 2,
    name: 'levin',
  };

  expect(eqUser.equals(a, b)).toBeFalsy();
});
