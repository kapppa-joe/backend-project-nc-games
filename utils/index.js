exports.makeCombinations = (...arrays) => {
  if (arrays.length === 0) {
    return [[]];
  } else if (arrays.length === 1) {
    return arrays[0].map((elem) => [elem]);
  } else if (arrays.length === 2) {
    const [arrayA, arrayB] = arrays;
    return arrayA.map((a) => arrayB.map((b) => [a, b].flat(1))).flat(1);
  } else {
    const combinationMadeFromTail = this.makeCombinations(...arrays.slice(1));
    return this.makeCombinations(arrays[0], combinationMadeFromTail);
  }
};
