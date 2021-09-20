const request = require("supertest");

const db = require("../db");
const app = require("../app");
const testData = require("../db/data/test-data/index.js");
const { seed } = require("../db/seeds/seed.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api/categories", () => {
  test("200: should respond with an array of categories", async () => {
    const res = await request(app).get("/api/categories").expect(200);

    expect(res.body).toHaveProperty("categories");
    res.body.categories.forEach((category) => {
      expect(category).toMatchObject({
        slug: expect.any(String),
        description: expect.any(String),
      });
    });
  });
});
