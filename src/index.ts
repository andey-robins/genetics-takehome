const triangular = require('@stdlib/random-base-triangular');

const config = {
  goal: 50000,
  numRats: 20,
  initialMinWt: 200,
  initialMaxWt: 600,
  initialModeWt: 300,
  mutateOdds: 0.01,
  mutateMin: 0.5,
  mutateMax: 1.2,
  litterSize: 8,
  littersPerYear: 10,
  generationLimit: 500,
};

const populate = (
  numRats: number,
  minWt: number,
  maxWt: number,
  modeWt: number
): number[] => {
  const rats: number[] = new Array(numRats)
    .fill(0)
    .map(() => Math.round(triangular(minWt, maxWt, modeWt)));
  return rats;
};

const fitness = (population: number[], goal: number): number => {
  return (
    population.reduce((a: number, b: number) => a + b) /
    population.length /
    goal
  );
};

const select = (
  population: number[],
  toRetain: number
): [number[], number[]] => {
  const sorted = population.sort((a, b) => a - b);
  const toRetainBySex = Math.floor(toRetain / 2);
  const membersPerSex = Math.round(population.length / 2);
  const femaleRats = sorted.slice(0, membersPerSex);
  const maleRats = sorted.slice(-membersPerSex, population.length);
  const selectedFemaleRats = femaleRats.slice(
    -toRetainBySex,
    femaleRats.length
  );
  const selectedMaleRats = maleRats.slice(-toRetainBySex, maleRats.length);
  return [selectedFemaleRats, selectedMaleRats];
};

const breed = (
  femaleRats: number[],
  maleRats: number[],
  litterSize: number
): number[] => {
  shuffleArray(femaleRats);
  shuffleArray(maleRats);
  const children = new Array(0);
  femaleRats.map((e, idx) => {
    for (let i = 0; i < litterSize; i++) {
      children.push(Math.floor(randRange(e, maleRats[idx])));
    }
  });
  return children;
};

const randRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const mutate = (
  children: number[],
  mutateOdds: number,
  mutateMin: number,
  mutateMax: number
): number[] => {
  return children.map(e => {
    if (mutateOdds >= Math.random()) {
      e = Math.round(e * randRange(mutateMin, mutateMax));
    }
    return e;
  });
};

const experiment = () => {
  let generations = 0;
  let parents = populate(
    config.numRats,
    config.initialMinWt,
    config.initialMaxWt,
    config.initialModeWt
  );
  let popFitness = fitness(parents, config.goal);
  const averageWeights = [];

  while (popFitness < 1 && generations < config.generationLimit) {
    const [selectedFemaleRats, selectedMaleRats] = select(
      parents,
      config.numRats
    );
    let children = breed(
      selectedFemaleRats,
      selectedMaleRats,
      config.litterSize
    );
    children = mutate(
      children,
      config.mutateOdds,
      config.mutateMin,
      config.mutateMax
    );
    parents = selectedFemaleRats.concat(selectedMaleRats).concat(children);
    popFitness = fitness(parents, config.goal);
    averageWeights.push(
      Math.floor(parents.reduce((a, b) => a + b) / parents.length)
    );
    generations++;
  }

  console.log('average weight per first generations:');
  console.log(averageWeights.slice(0, 100));
  console.log('average weight per last generations:');
  console.log(averageWeights.slice(-100, averageWeights.length));
  console.log('\nnumber of generations', generations);
  console.log(
    'number of years',
    Math.ceil(generations / config.littersPerYear)
  );
};

experiment();
