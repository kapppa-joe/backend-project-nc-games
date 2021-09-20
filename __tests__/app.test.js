const db = require("../db");
const testData = require("../db/data/test-data/index.js");
const { seed } = require("../db/seeds/seed.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("Name of the group", () => {
  test("should ", () => {});
});
