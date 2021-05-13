import * as List from 'fp-ts/lib/Array';

type Planet = {
  name: string;
  diameter: number;
  distance: number;
};

const planetList: Array<Planet> = [
  { name: 'Mercury', diameter: 4879.4, distance: 0.39 },
  { name: 'Venus', diameter: 12104, distance: 0.723 },
  { name: 'Earth', diameter: 12756, distance: 1 },
  { name: 'Mars', diameter: 6779, distance: 1.524 },
  { name: 'Jupiter', diameter: 142800, distance: 5.203 },
  { name: 'Saturn', diameter: 120660, distance: 9.539 },
  { name: 'Uranus', diameter: 51118, distance: 19.18 },
  { name: 'Neptune', diameter: 49528, distance: 30.06 },
];

const nearbyPlanetList: Array<Planet> = [
  { name: 'Mercury', diameter: 4879.4, distance: 0.39 },
  { name: 'Venus', diameter: 12104, distance: 0.723 },
  { name: 'Earth', diameter: 12756, distance: 1 },
];

const middlePlanetList: Array<Planet> = [
  { name: 'Mars', diameter: 6779, distance: 1.524 },
  { name: 'Jupiter', diameter: 142800, distance: 5.203 },
  { name: 'Saturn', diameter: 120660, distance: 9.539 },
];

const distantPlanetList: Array<Planet> = [
  { name: 'Uranus', diameter: 51118, distance: 19.18 },
  { name: 'Neptune', diameter: 49528, distance: 30.06 },
];

//===== Associativity =====

// d ⨁ (m ⨁ n)
const a = List.alt(() => distantPlanetList)(
  List.alt(() => middlePlanetList)(nearbyPlanetList)
);
// (d ⨁ m) ⨁ n
const b = List.alt(() => List.alt(() => distantPlanetList)(middlePlanetList))(
  nearbyPlanetList
);
