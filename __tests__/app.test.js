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
    for (let testId = 1; testId <= 13; testId++) {
      const res = await request(app).get(`/api/reviews/${testId}`).expect(200);

      expect(res.body).toHaveProperty("review");
      const { review } = res.body;

      expect(review).toMatchObject({
        owner: expect.any(String),
        title: expect.any(String),
        review_id: testId,
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
    const testId = 99999;
    const res = await request(app).get(`/api/reviews/${testId}`).expect(404);
    expect(res.body.msg).toBe("review_id not exists");
  });

  test('400: respond with msg "Bad request" when review_id is not valid', async () => {
    const testId = "1 ; DROP TABLE reviews;"; // SQL injection!
    const res = await request(app).get(`/api/reviews/${testId}`).expect(400);
    expect(res.body.msg).toBe("Bad request");
  });
});

describe("PATCH /api/reviews/:review_id", () => {
  test("200: accept object with inc_votes property and respond with patched review object", async () => {
    const testId = 2;
    const votesBeforePatch = 5;
    const inc_votes = 3;

    const res = await request(app)
      .patch(`/api/reviews/${testId}`)
      .send({ inc_votes })
      .expect(200);
    expect(res.body).toHaveProperty("review");

    expect(res.body.review).toMatchObject({
      review_id: testId,
      votes: votesBeforePatch + inc_votes,
    });

    // verify that votes in db is updated
    const queryResult = await db.query(
      `SELECT votes FROM reviews WHERE review_id = 2`
    );
    expect((queryResult.rows[0].votes = votesBeforePatch + inc_votes));
  });

  test("200: passing a negative inc_votes can decrease votes", async () => {
    const testId = 2;
    const votesBeforePatch = 5;
    const inc_votes = -10;

    const res = await request(app)
      .patch(`/api/reviews/${testId}`)
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

  describe("sort_by query", () => {
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
        expect(res.body.reviews).toBeSorted({
          key: sortByKey,
          descending: true,
        });
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
  });
  describe("order by query", () => {
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
        const res = await request(app)
          .get(`/api/reviews?sort_by=${sort_by}&order=${order}`)
          .expect(200);
        expect(res.body.reviews.length).toBeGreaterThan(0);
        expect(res.body.reviews).toBeSorted({
          key: sort_by,
          descending: order === "desc",
        });
      }
    });
    test("400: respond with 'Bad request' when `order` query is invalid", async () => {
      const res = await request(app)
        .get("/api/reviews?order=apple")
        .expect(400);
      expect(res.body.msg).toBe("Bad request");

      const res2 = await request(app)
        .get("/api/reviews?order=asc;DROP TABLE reviews;")
        .expect(400);
      expect(res2.body.msg).toBe("Bad request");
    });
  });

  describe("`category` query", () => {
    test("200: respond with reviews filtered by `category` given", async () => {
      const testCategory = "social deduction";
      const res = await request(app)
        .get(`/api/reviews?category=${testCategory}`)
        .expect(200);
      expect(res.body.reviews).toHaveLength(11);
      res.body.reviews.forEach((review) => {
        expect(review.category === testCategory);
      });
    });

    test("200: respond correctly even if 0 reviews in given category", async () => {
      const category = "children's games";
      const res = await request(app)
        .get(`/api/reviews?category=${category}`)
        .expect(200);
      expect(res.body.reviews).toHaveLength(0);
    });

    test("400: respond with 'Bad request' if category is invalid", async () => {
      const res = await request(app)
        .get(`/api/reviews?category=some_random_words`)
        .expect(400);
      expect(res.body.msg).toBe("Bad request");

      const res2 = await request(app)
        .get(`/api/reviews?sort_by=created_at&category=hello`)
        .expect(400);
      expect(res2.body.msg).toBe("Bad request");
    });

    test("200: can handle sort_by, order, category at the same time and respond correctly", async () => {
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
      const choicesForCategory = [
        "euro game",
        "dexterity",
        "social deduction",
        "children's games",
      ];

      const combinationsToTest = makeCombinations(
        choicesForSortBy,
        choicesForOrder,
        choicesForCategory
      );

      for (const [sort_by, order, category] of combinationsToTest) {
        const res = await request(app)
          .get(
            `/api/reviews?sort_by=${sort_by}&order=${order}&category=${category}`
          )
          .expect(200);
        if (category === "children's games") {
          // no review for that category in test data.
          expect(res.body.reviews.length).toBe(0);
        } else {
          expect(res.body.reviews.length).toBeGreaterThan(0);
          expect(res.body.reviews).toBeSorted({
            key: sort_by,
            descending: order === "desc",
          });
        }
      }
    });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("200: respond with comments of given review_id", async () => {
    const testId = 2;
    const res = await request(app)
      .get(`/api/reviews/${testId}/comments`)
      .expect(200);

    expect(res.body.comments).toHaveLength(3);

    res.body.comments.forEach((comment) => {
      expect(comment).toMatchObject({
        comment_id: expect.any(Number),
        votes: expect.any(Number),
        created_at: expect.any(String),
        author: expect.any(String),
        body: expect.any(String),
        review_id: testId,
      });
      expect(new Date(comment.created_at).toString()).not.toBe("Invalid Date");
    });
  });

  test("200: respond with empty array when given review_id has no comments", async () => {
    const testId = 1;
    const res = await request(app)
      .get(`/api/reviews/${testId}/comments`)
      .expect(200);
    expect(res.body.comments).toHaveLength(0);
  });

  test("400: respond with 'Bad request' when review_id is invalid", async () => {
    const res = await request(app)
      .get("/api/reviews/jaffa_cake_is_biscuit/comments")
      .expect(400);
    expect(res.body.msg).toBe("Bad request");
  });

  test("404: respond with 'review_id not exists' when review_id is valid but not exist", async () => {
    const res = await request(app)
      .get("/api/reviews/99999/comments")
      .expect(404);
    expect(res.body.msg).toBe("review_id not exists");
  });
});
