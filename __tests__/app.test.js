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

describe("GET /api/reviews/:review_id", () => {
  test("200: should respond with an review object", async () => {
    const review_id = 3;
    const res = await request(app).get(`/api/reviews/${review_id}`).expect(200);

    expect(res.body).toHaveProperty("review");
    const { review } = res.body;

    expect(review).toMatchObject({
      review_id: review_id,
      title: expect.any(String),
      designer: expect.any(String),
      owner: expect.any(String),
      review_img_url: expect.any(String),
      review_body: expect.any(String),
      category: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
    });

    expect(new Date(review.created_at).toString()).not.toBe("Invalid Date");
  });

  test('404: respond with msg "review_id not exists" when review_id is is valid but does not exist', async () => {
    const review_id = 99999;
    const res = await request(app).get(`/api/reviews/${review_id}`).expect(404);
    expect(res.body.msg).toBe("review_id not exists");
  });

  test('400: respond with msg "Bad request" when review_id is not valid', async () => {
    const review_id = "1 ; DROP TABLE reviews;";
    const res = await request(app).get(`/api/reviews/${review_id}`).expect(400);
    expect(res.body.msg).toBe("Bad request");
  });
});
