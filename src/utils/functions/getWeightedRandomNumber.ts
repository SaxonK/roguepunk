const getWeightedRandomNumber = (totalWeight: number): number => {
  return Math.floor(Math.random() * totalWeight);
};

export default getWeightedRandomNumber;