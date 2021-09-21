const { makeCombinations } = require("../utils");

describe("makeCombinations", () => {
  test("return [[]] if given input = []", () => {
    expect(makeCombinations()).toEqual([[]]);
  });

  test("if given one array, return each of its elements wrapped in an array", () => {
    const input = ["a", "b", "c"];
    const expectedOutput = [["a"], ["b"], ["c"]];

    expect(makeCombinations(input)).toEqual(expectedOutput);
  });

  test("take 2 arrays and return all combinations made from them, taking one elem from each array at one time", () => {
    const inputA = ["a", "b", "c"];
    const inputB = [1, 2];
    const expectedResults = [
      ["a", 1],
      ["a", 2],
      ["b", 1],
      ["b", 2],
      ["c", 1],
      ["c", 2],
    ];
    expect(makeCombinations(inputA, inputB)).toEqual(expectedResults);
  });

  test("do not mutate the input arrays", () => {
    const input = ["a", "b", "c"];

    const inputClone = ["a", "b", "c"];

    makeCombinations(input);
    expect(input).toEqual(inputClone);
  });

  test("work for more then 2 arguments", () => {
    const inputs = [
      ["a", "b"],
      [1, 2, 3],
      ["foo", "bar"],
    ];
    const expectedOutput = [
      ["a", 1, "foo"],
      ["a", 1, "bar"],
      ["a", 2, "foo"],
      ["a", 2, "bar"],
      ["a", 3, "foo"],
      ["a", 3, "bar"],
      ["b", 1, "foo"],
      ["b", 1, "bar"],
      ["b", 2, "foo"],
      ["b", 2, "bar"],
      ["b", 3, "foo"],
      ["b", 3, "bar"],
    ];

    expect(makeCombinations(...inputs)).toEqual(expectedOutput);
  });
});
