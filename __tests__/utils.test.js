const { makeCombinations } = require("../utils");
const {
  mapDataToNestedArray,
  createInsertQuery,
} = require("../db/utils/data-manipulation");

const format = require("pg-format");

describe("mapDataToNestedArray", () => {
  test("return an empty array if dataArray is empty", () => {
    expect(mapDataToNestedArray(["a", "b"], [])).toEqual([]);
  });

  test("convert an array of objects into nested array format in the order specified in input array", () => {
    const columns = ["a", "b"];
    const data = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ];

    expectedOutput = [
      [1, 2],
      [3, 4],
    ];

    expect(mapDataToNestedArray(columns, data)).toEqual(expectedOutput);
  });

  test("do not mutate the inputs", () => {
    const columns = ["a", "b"];
    const columnsClone = ["a", "b"];
    const data = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ];
    const dataClone = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ];

    mapDataToNestedArray(columns, data);

    expect(columns).toEqual(columnsClone);
    expect(data).toEqual(dataClone);
  });
});

describe("createInsertQuery", () => {
  test("return an empty string if either of the inputs are empty", () => {
    expect(createInsertQuery("", [{ a: 1, b: true }])).toBe("");
    expect(createInsertQuery("user", [])).toBe("");
  });

  test("return a sql query string to insert into db table", () => {
    const tableName = "users";
    const data = [
      {
        username: "mallionaire",
        name: "haz",
      },
      {
        username: "philippaclaire9",
        name: "philippa",
      },
    ];

    const expectedOutput =
      "INSERT INTO users (username, name) VALUES ('mallionaire', 'haz'), ('philippaclaire9', 'philippa') RETURNING *;";

    expect(createInsertQuery(tableName, data)).toBe(expectedOutput);
  });
});

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
