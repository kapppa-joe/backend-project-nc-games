const request = require("supertest");

const db = require("../db");
const app = require("../app");
const testData = require("../db/data/test-data/index.js");
const { seed } = require("../db/seeds/seed.js");

const { makeCombinations } = require("../utils/");

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
    for (let review_id = 1; review_id <= 13; review_id++) {
      const res = await request(app)
        .get(`/api/reviews/${review_id}`)
        .expect(200);

      expect(res.body).toHaveProperty("review");
      const { review } = res.body;

      expect(review).toMatchObject({
        owner: expect.any(String),
        title: expect.any(String),
        review_id: review_id,
        review_body: expect.any(String),
        designer: expect.any(String),
        review_img_url: expect.any(String),
        category: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        comment_count: expect.any(Number),
      });

      expect(new Date(review.created_at).toString()).not.toBe("Invalid Date");
    }
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

describe("PATCH /api/reviews/:review_id", () => {
  test("200: accept object with inc_votes property and respond with patched review object", async () => {
    const review_id = 2;
    const votesBeforePatch = 5;
    const inc_votes = 3;

    const res = await request(app)
      .patch(`/api/reviews/${review_id}`)
      .send({ inc_votes })
      .expect(200);
    expect(res.body).toHaveProperty("review");

    expect(res.body.review).toMatchObject({
      review_id: review_id,
      votes: votesBeforePatch + inc_votes,
    });

    // verify that votes in db is updated
    const queryResult = await db.query(
      `SELECT votes FROM reviews WHERE review_id = 2`
    );
    expect((queryResult.rows[0].votes = votesBeforePatch + inc_votes));
  });

  test("200: passing a negative inc_votes can decrease votes", async () => {
    const review_id = 2;
    const votesBeforePatch = 5;
    const inc_votes = -10;

    const res = await request(app)
      .patch(`/api/reviews/${review_id}`)
      .send({ inc_votes })
      .expect(200);
    expect(res.body.review.votes).toBe(votesBeforePatch + inc_votes);
  });

  test("400: respond with 'Bad request' if value of inc_vote is invalid", async () => {
    const res = await request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: "some_invalid_things" })
      .expect(400);
    expect(res.body.msg).toBe("Bad request");
  });

  test("400: respond with 'Bad request' if review_id is invalid", async () => {
    const res = await request(app)
      .patch("/api/reviews/some_invalid_id")
      .send({ inc_votes: 3 })
      .expect(400);
    expect(res.body.msg).toBe("Bad request");
  });

  test("404: respond with 'review_id not exists' if review_id does not exists", async () => {
    const res = await request(app)
      .patch("/api/reviews/9999")
      .send({ inc_votes: 3 })
      .expect(404);
    expect(res.body.msg).toBe("review_id not exists");
  });
});

describe("GET /api/reviews", () => {
  test("200: respond with an array of review objects", async () => {
    const res = await request(app).get("/api/reviews").expect(200);

    expect(res.body).toHaveProperty("reviews");
    expect(res.body.reviews).toHaveLength(13);

    res.body.reviews.forEach((review) => {
      expect(review).toMatchObject({
        owner: expect.any(String),
        title: expect.any(String),
        review_id: expect.any(Number),
        category: expect.any(String),
        review_img_url: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        comment_count: expect.any(Number),
      });
      expect(new Date(review.created_at).toString()).not.toBe("Invalid Date");
    });
  });

  test("200: reviews should be sorted by create_at date in desc order by default", async () => {
    const res = await request(app).get("/api/reviews").expect(200);

    const { reviews } = res.body;
    expect(reviews).toBeSorted({
      key: "created_at",
      descending: true,
    });
  });

  test("200: accept a sort_by query and respond with sorted results", async () => {
    const keysToTest = [
      "owner",
      "title",
      "review_id",
      "category",
      "review_img_url",
      "created_at",
      "votes",
      "comment_count",
    ];

    for (const sortByKey of keysToTest) {
      const res = await request(app)
        .get(`/api/reviews?sort_by=${sortByKey}`)
        .expect(200);
      expect(res.body.reviews).toBeSorted({ key: sortByKey, descending: true });
    }
  });

  test("400: respond with 'Bad request' when sort_by key is invalid", async () => {
    const res = await request(app)
      .get("/api/reviews?sort_by=an_invalid_key")
      .expect(400);
    expect(res.body.msg).toBe("Bad request");

    const res2 = await request(app)
      .get(
        "/api/reviews?sort_by=title;DROP TABLE comments; DROP TABLE reviews;"
      )
      .expect(400);
    expect(res2.body.msg).toBe("Bad request");
  });

  test("200: accept a 'order' query which can be 'asc' or 'desc' for ascending or descending", async () => {
    const choicesForSortBy = [
      "owner",
      "title",
      "review_id",
      "category",
      "review_img_url",
      "created_at",
      "votes",
      "comment_count",
    ];
    const choicesForOrder = ["desc", "asc"];
    const combinationsToTest = makeCombinations(
      choicesForSortBy,
      choicesForOrder
    );

    for (const [sort_by, order] of combinationsToTest) {
      const result = await request(app)
        .get(`/api/reviews?sort_by=${sort_by}&order=${order}`)
        .expect(200);
      expect(result.body.reviews.length).toBeGreaterThan(0);
      expect(result.body.reviews).toBeSorted({
        key: sort_by,
        descending: order === "desc",
      });
    }
  });

  test("400: respond with 'Bad request' when `order` query is invalid", async () => {
    const res = await request(app).get("/api/reviews?order=apple").expect(400);
    expect(res.body.msg).toBe("Bad request");

    const res2 = await request(app)
      .get("/api/reviews?order=asc;DROP TABLE reviews;")
      .expect(400);
    expect(res2.body.msg).toBe("Bad request");
  });
});
