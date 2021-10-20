const request = require("supertest");

const db = require("../db");
const app = require("../app");
const testData = require("../db/data/test-data/index.js");
const { seed } = require("../db/seeds/seed.js");

const { makeCombinations } = require("../utils/");

beforeEach(() => seed(testData));
afterAll(() => db.end());

expect.extend({
  toBeSubsetOf(receivedArray, arraytoCompare) {
    const pass = receivedArray.every((elem) => arraytoCompare.includes(elem));
    if (pass) {
      return {
        message: () =>
          `expected ${receivedArray} not to be subset of ${arraytoCompare}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${receivedArray} to be subset of ${arraytoCompare}`,
        pass: false,
      };
    }
  },
});

describe("GET /not-a-route", () => {
  test("404: respond with msg 'Not found'", async () => {
    const res = await request(app).get("/api/not-a-route").expect(404);
    expect(res.body.msg).toBe("Not found");
  });
});

describe("GET /api", () => {
  test("200: should respond with an array of available endpoints", async () => {
    const res = await request(app).get("/api").expect(200);
    expect(res.body).toHaveProperty("GET /api");
  });
});

describe("405 Method Not Allowed handler", () => {
  test("405: responds with 'Method not allowed' when client sent a request to a valid route but the method is not supported.", async () => {
    const testForPost = request(app).post("/api").send({}).expect(405);
    const testForDelete = request(app).delete("/api").expect(405);
    const testForPatch = request(app).patch("/api").send({}).expect(405);

    const results = await Promise.all([
      testForPost,
      testForDelete,
      testForPatch,
    ]);
    results.forEach((res) => {
      expect(res.body.msg).toBe("Method not allowed");
    });
  });

  test("405: responds correctly for routes in categories/comments/reviews/users routers", async () => {
    const testPromises = [
      request(app).delete("/api/categories").expect(405),
      request(app).post("/api/comments/1").expect(405),
      request(app).delete("/api/reviews").expect(405),
      request(app).post("/api/reviews/1").expect(405),
      request(app).delete("/api/reviews/1/comments").expect(405),
      request(app).delete("/api/users").expect(405),
      request(app).post("/api/users/1").expect(405),
    ];

    const responses = await Promise.all(testPromises);
    responses.forEach((res) => {
      expect(res.body.msg).toBe("Method not allowed");
    });
  });

  test("405: include an Allow header containing a list of valid methods for the route.", async () => {
    const res1 = await request(app).post("/api").send({}).expect(405);
    expect(res1.get("Allow")).toBe("GET");

    const res2 = await request(app).patch("/api/reviews").send({}).expect(405);
    expect(res2.get("Allow")).toBe("GET, POST");
  });

  // and an array of allowed methods
});

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

describe("POST /api/categories", () => {
  test("201: respond with new category object", async () => {
    const testCategory = {
      slug: "Tabletalk RPG",
      description:
        "A form of role-playing game (RPG) in which the participants describe their characters' actions through speech",
    };

    const res = await request(app)
      .post("/api/categories")
      .send(testCategory)
      .expect(201);
    expect(res.body.category).toMatchObject({
      slug: "Tabletalk RPG",
      description:
        "A form of role-playing game (RPG) in which the participants describe their characters' actions through speech",
    });

    const result = await db.query(
      `SELECT * FROM categories WHERE slug = '${testCategory.slug}'`
    );
    expect(result.rows.length === 1);
  });

  test("201: ignore unwanted property in received data", async () => {
    const testCategory = {
      slug: "Tabletalk RPG",
      description:
        "A form of role-playing game (RPG) in which the participants describe their characters' actions through speech",
      apple: "red",
      username: "David",
    };

    const res = await request(app)
      .post("/api/categories")
      .send(testCategory)
      .expect(201);
    expect(res.body.category).toMatchObject({
      slug: "Tabletalk RPG",
      description:
        "A form of role-playing game (RPG) in which the participants describe their characters' actions through speech",
    });
  });

  test("400: respond with 'Bad request' if either `slug` or `description` is missing", async () => {
    const testData = [
      {},
      { slug: "Tabletalk RPG" },
      {
        description:
          "A form of role-playing game (RPG) in which the participants describe their characters' actions through speech",
      },
    ];
    const testPromises = testData.map((data) =>
      request(app).post("/api/categories").send(data).expect(400)
    );
    const results = await Promise.all(testPromises);

    for (const res of results) {
      expect(res.body.msg).toBe("Bad request");
    }
  });
});

describe("GET /api/reviews", () => {
  test("200: respond with an array of review objects", async () => {
    const res = await request(app).get("/api/reviews").expect(200);

    expect(res.body).toHaveProperty("reviews");
    expect(res.body.reviews.length).toBeGreaterThan(0);

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

  test("200: reviews should be sorted by `create_at` date in desc order by default", async () => {
    const res = await request(app).get("/api/reviews").expect(200);

    const { reviews } = res.body;
    expect(reviews).toBeSorted({
      key: "created_at",
      descending: true,
    });
  });

  describe("GET /api/reviews `sort_by` query", () => {
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

  describe("GET /api/reviews `order` query", () => {
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

  describe("GET /api/reviews `category` query", () => {
    test("200: respond with reviews filtered by `category` given", async () => {
      const testCategory = "social deduction";
      const res = await request(app)
        .get(`/api/reviews?category=${testCategory}`)
        .expect(200);
      expect(res.body.reviews.length).toBeGreaterThan(0);
      res.body.reviews.forEach((review) => {
        expect(review.category === testCategory);
      });
    });

    test("200: respond with 200 OK for categories which do exist but have no reviews related to it", async () => {
      const category = "children's games";
      const res = await request(app)
        .get(`/api/reviews?category=${category}`)
        .expect(200);
      expect(res.body.reviews).toHaveLength(0);
    });

    test("404: respond with 'Not found' if category is invalid", async () => {
      const res = await request(app)
        .get(`/api/reviews?category=some_random_words`)
        .expect(404);
      expect(res.body.msg).toBe("Not found");

      const res2 = await request(app)
        .get(`/api/reviews?sort_by=created_at&category=hello`)
        .expect(404);
      expect(res2.body.msg).toBe("Not found");
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

  describe("GET /api/reviews `search` query", () => {
    test("200: respond with reviews which content matches search keywords", async () => {
      const testSearchTerm = "build";
      const res = await request(app)
        .get(
          `/api/reviews?search=${testSearchTerm}&sort_by=review_id&order=asc`
        )
        .expect(200);
      expect(res.body.reviews).toHaveLength(2);
      expect(res.body.total_count).toBe(2);
      const { reviews } = res.body;
      expect(reviews[0]).toMatchObject({
        title: "Build you own tour de Yorkshire",
      });
      expect(reviews[1].review_body.includes("build")).toBe(true);
    });

    test("200: `search` and `category` can be handled together", async () => {
      const testSearchTerm = "fun";
      const testCategory = "euro game";
      const res = await request(app)
        .get(`/api/reviews?search=${testSearchTerm}&category=${testCategory}`)
        .expect(200);
      expect(res.body.reviews).toHaveLength(1);
      expect(res.body.total_count).toBe(1);
      expect(res.body.reviews[0]).toMatchObject({
        title: "Agricola",
        review_body: "Farmyard fun!",
        category: testCategory,
      });
    });
  });

  describe("GET /api/reviews pagination", () => {
    test("200: accept query `limit`, `p` and respond with limited results", async () => {
      const testLimit = 5;
      const testPageNo = 2;
      const res = await request(app)
        .get(
          `/api/reviews?sort_by=review_id&order=asc&limit=${testLimit}&p=${testPageNo}`
        )
        .expect(200);
      expect(res.body.reviews).toHaveLength(testLimit);
      expect(res.body.reviews[0].review_id).toBe(
        testLimit * (testPageNo - 1) + 1
      );
    });

    test("200: show result of 1-10 by default", async () => {
      const res = await request(app)
        .get("/api/reviews?sort_by=review_id&order=asc")
        .expect(200);
      expect(res.body.reviews).toHaveLength(10);
      expect(res.body.reviews[0].review_id).toBe(1);
      expect(res.body.reviews[9].review_id).toBe(10);
    });

    test("200: provide a `total_count` property displaying the total number of reviews", async () => {
      const res = await request(app).get("/api/reviews").expect(200);
      expect(res.body).toHaveProperty("total_count");
      expect(res.body.total_count).toBe(13);
    });

    test("200: `limit`, `p` and `total_count` should work correctly with category filter applied", async () => {
      const testCategory = "social deduction";
      const limit = 3;
      const p = 3;
      const res = await request(app)
        .get(
          `/api/reviews?p=${p}&limit=${limit}&category=${testCategory}&order=asc&sort_by=review_id`
        )
        .expect(200);

      expect(res.body.reviews).toHaveLength(3);
      expect(res.body.total_count).toBe(11);
      res.body.reviews.forEach((review) => {
        expect(review.category).toBe(testCategory);
      });
    });

    test("200: respond OK and respond with empty array if limit & p exceed the total count of data", async () => {
      const res = await request(app)
        .get("/api/reviews?limit=1000&p=1000")
        .expect(200);
      expect(res.body.reviews).toEqual([]);
    });

    test("400: respond with bad request when either limit or p or both are invalid or empty", async () => {
      const testPromises = [
        request(app).get("/api/reviews?limit=cat").expect(400),
        request(app).get("/api/reviews?p=apple").expect(400),
        request(app).get("/api/reviews?limit=-3").expect(400),
        request(app).get("/api/reviews?p=-10").expect(400),
        request(app).get("/api/reviews?limit=").expect(400),
        request(app).get("/api/reviews?p=").expect(400),
        request(app).get("/api/reviews?limit=&p=").expect(400),
        request(app).get("/api/reviews?limit=cat&p=dog").expect(400),
      ];
      const results = await Promise.all(testPromises);
      results.forEach((res) => {
        expect(res.body.msg).toBe("Bad request");
      });
    });
  });
});

describe("POST /api/reviews", () => {
  test("201: accept a new review and respond with review object", async () => {
    const testReview = {
      owner: "bainesface",
      title: "A new review",
      designer: "Lawson Kautzer",
      category: "children's games",
      review_body: "This game is sooo funny!",
    };

    const startOfRequest = new Date();
    const res = await request(app)
      .post("/api/reviews")
      .send(testReview)
      .expect(201);
    const endOfRequest = new Date();

    expect(res.body.review).toMatchObject({
      review_id: 14,
      created_at: expect.any(String),
      votes: 0,
      comment_count: 0,
      ...testReview,
    });

    // check the create_at timestamp to be generated correctly
    const timeStampOfNewReview = new Date(res.body.review.created_at);
    expect(timeStampOfNewReview > startOfRequest).toBe(true);
    expect(timeStampOfNewReview < endOfRequest).toBe(true);
  });

  test("400: respond with 'Bad request' if req body is empty", async () => {
    const res = await request(app).post("/api/reviews").send("").expect(400);
    expect(res.body.msg).toBe("Bad request");
  });

  test("400: respond with 'Bad request' if any of the columns `owner`, `review_body` or `category` are missing", async () => {
    const testReviews = [
      {
        // owner missing
        title: "A new review",
        review_body: "This game is sooooooooo funny!",
        designer: "Lawson Kautzer",
        category: "children's games",
        review_img_url:
          "https://cdn.pixabay.com/photo/2019/07/30/05/53/dog-4372036_1280.jpg",
      },
      {
        owner: "bainesface",
        title: "A new review",
        // review_body missing
        designer: "Lawson Kautzer",
        category: "children's games",
        review_img_url:
          "https://cdn.pixabay.com/photo/2019/07/30/05/53/dog-4372036_1280.jpg",
      },
      {
        owner: "bainesface",
        title: "A new review",
        review_body: "This game is sooooooooo funny!",
        designer: "Lawson Kautzer",
        // category missing
        review_img_url:
          "https://cdn.pixabay.com/photo/2019/07/30/05/53/dog-4372036_1280.jpg",
      },
    ];

    const testPromises = testReviews.map((review) =>
      request(app).post("/api/reviews").send(review).expect(400)
    );
    const results = await Promise.all(testPromises);

    results.forEach((res) => {
      expect(res.body.msg).toBe("Bad request");
    });
  });

  test("404: respond with 'Bad request' if `owner` or `category` does not match the record in db", async () => {
    const testReviews = [
      {
        owner: "no_such_user",
        title: "A new review",
        review_body: "This game is sooooooooo funny!",
        designer: "Lawson Kautzer",
        category: "children's games",
        review_img_url:
          "https://cdn.pixabay.com/photo/2019/07/30/05/53/dog-4372036_1280.jpg",
      },
      {
        owner: "bainesface",
        title: "A new review",
        review_body: "This game is sooooooooo funny!",
        designer: "Lawson Kautzer",
        category: "an invalid category",
        review_img_url:
          "https://cdn.pixabay.com/photo/2019/07/30/05/53/dog-4372036_1280.jpg",
      },
    ];

    for (const review of testReviews) {
      const res = await request(app)
        .post("/api/reviews/")
        .send(review)
        .expect(404);
      if (review.owner === "no_such_user") {
        expect(res.body.msg).toBe("owner username not exists");
      }
      if (review.category === "an invalid category") {
        expect(res.body.msg).toBe("category not exists");
      }
    }
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

  test('404: respond with msg "review_id not exists" when review_id is wellformed but does not exist', async () => {
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

describe("DELETE /api/review/review_id", () => {
  test("204: should respond with `no content` and delete the review from db", async () => {
    const testId = 2;
    const res = await request(app).delete(`/api/reviews/${testId}`).expect(204);
    expect(res.body).toEqual({});

    const queryResult = await db.query(
      `SELECT * FROM reviews WHERE review_id = '${testId}'`
    );
    expect(queryResult.rows.length === 0);
  });

  test('404: respond with "review_id not exists" when given a wellformed but non-exist review_id', async () => {
    const testId = 99999;
    const res = await request(app).delete(`/api/reviews/${testId}`).expect(404);
    expect(res.body.msg).toBe("review_id not exists");
  });

  test('400: respond with "Bad request" when given an invalid review_id', async () => {
    const testId = "1; DROP TABLE reviews;";
    const res = await request(app).delete(`/api/reviews/${testId}`).expect(400);
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

  test("200: passing a `review_body` prop and `username` prop allows amending review body", async () => {
    const testId = 2;
    const newReviewBody = "Edited just now :D";
    const testUsername = "philippaclaire9";

    const res = await request(app)
      .patch(`/api/reviews/${testId}`)
      .send({ review_body: newReviewBody, username: testUsername })
      .expect(200);
    expect(res.body.review).toMatchObject({
      review_id: testId,
      review_body: newReviewBody,
      owner: testUsername,
    });
  });

  test("200: should only handle inc_votes and ignore other irrelevent properties", async () => {
    const testId = 1;
    const votesBeforePatch = 1;
    const inc_votes = 6;

    const res = await request(app)
      .patch(`/api/reviews/${testId}`)
      .send({
        inc_votes,
        category: "dexterity",
        username: "Paul",
        jaffa_cakes_are_biscuits: true,
      })
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

  test("400: respond with 'Bad request' if inc_votes is not provided", async () => {
    const res = await request(app).patch("/api/reviews/2").send({}).expect(400);
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

  test("404: respond with 404 error if requested to update review_body but username not matching review owner", async () => {
    const testId = 2;
    const newReviewBody = "Edited just now :D";
    const testUsername = "no_such_user";

    const res = await request(app)
      .patch(`/api/reviews/${testId}`)
      .send({ review_body: newReviewBody, username: testUsername })
      .expect(404);
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

describe("POST /api/reviews/:review_id/comments", () => {
  test("201: respond with new comment", async () => {
    const testId = 2;
    const testComment = {
      username: "mallionaire",
      body: "a new comment",
    };

    // record the start time for later use
    const startTime = new Date();

    const res = await request(app)
      .post(`/api/reviews/${testId}/comments`)
      .send(testComment)
      .expect(201);

    expect(res.body.comment).toMatchObject({
      comment_id: 7, // test seed data have 6 comments.
      author: testComment.username,
      body: testComment.body,
      created_at: expect.any(String),
      votes: 0,
      review_id: testId,
    });

    const newCommentTimeStamp = new Date(res.body.comment.created_at);
    // check created_at is a valid time
    expect(newCommentTimeStamp.toString()).not.toBe("Invalid Date");

    // check created_at is correct time i.e. time of posting the new comment.
    const timeNow = new Date();
    expect(newCommentTimeStamp - startTime).toBeGreaterThan(0);
    expect(newCommentTimeStamp - timeNow).toBeLessThan(0);

    // verify db get the new comment
    const result = await db.query(
      `SELECT * FROM comments WHERE body = '${testComment.body}';`
    );
    expect(result.rows).toHaveLength(1);
  });

  test("400: respond with 'Bad request' when username / body / both are not given", async () => {
    const res = await request(app)
      .post("/api/reviews/2/comments")
      .send({ username: "dav3rid" })
      .expect(400);

    expect(res.body.msg).toBe("Bad request");

    const res2 = await request(app)
      .post("/api/reviews/2/comments")
      .send({ body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit" })
      .expect(400);

    expect(res2.body.msg).toBe("Bad request");

    const res3 = await request(app)
      .post("/api/reviews/2/comments")
      .send({})
      .expect(400);

    expect(res3.body.msg).toBe("Bad request");
  });

  test("404: respond with 'author username not exists' when `author`(username) does not exist in database record", async () => {
    const res = await request(app)
      .post("/api/reviews/3/comments")
      .send({ username: "no_such_user", body: "A new comment :D" })
      .expect(404);

    expect(res.body.msg).toBe("author username not exists");
  });

  test("400: respond with 'Bad request' when review_id is not valid", async () => {
    const res = await request(app)
      .post("/api/reviews/wanna_have_a_jaffa_cake/comments")
      .send({ username: "dav3rid", body: "A new comment" })
      .expect(400);

    expect(res.body.msg).toBe("Bad request");
  });

  test("404: respond with 'review_id not exists' when review_id is valid but does not exist", async () => {
    const res = await request(app)
      .post("/api/reviews/99999/comments")
      .send({ username: "dav3rid", body: "A new comment :D" })
      .expect(404);

    expect(res.body.msg).toBe("review_id not exists");
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: delete the comment of given comment_id and respond with no content", async () => {
    const testId = 2;
    const res = await request(app)
      .delete(`/api/comments/${testId}`)
      .expect(204);
    expect(res.body).toEqual({});

    const result = await db.query(
      `SELECT * FROM comments WHERE comment_id = ${testId}`
    );
    expect(result.rows).toHaveLength(0);
  });

  test("404: respond with 'comment_id not exists' when given comment_id is wellformed but not in databose", async () => {
    const res = await request(app).delete("/api/comments/99999").expect(404);
    expect(res.body.msg).toBe("comment_id not exists");
  });

  test("400: respond with 'Bad request' when comment_id is invalid", async () => {
    const res = await request(app)
      .delete("/api/comments/puppy_running_around")
      .expect(400);
    expect(res.body.msg).toBe("Bad request");

    const res2 = await request(app)
      .delete("/api/comments/3;DROP TABLE comments")
      .expect(400);
    expect(res2.body.msg).toBe("Bad request");
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: accept object with inc_votes property and respond with patched comment object", async () => {
    const testId = 2;
    const votesBeforePatch = 13;
    const inc_votes = 6;

    const res = await request(app)
      .patch(`/api/comments/${testId}`)
      .send({ inc_votes })
      .expect(200);
    expect(res.body).toHaveProperty("comment");

    expect(res.body.comment).toMatchObject({
      comment_id: testId,
      votes: votesBeforePatch + inc_votes,
    });

    // verify that votes in db is updated
    const queryResult = await db.query(
      `SELECT votes FROM comments WHERE comment_id = ${testId}`
    );
    expect((queryResult.rows[0].votes = votesBeforePatch + inc_votes));
  });

  test("200: accept object with `body` property and respond with patched comment object", async () => {
    const testId = 2;
    const newCommentBody = "revise my comment!";
    const res = await request(app)
      .patch(`/api/comments/${testId}`)
      .send({ body: newCommentBody })
      .expect(200);

    expect(res.body.comment).toMatchObject({
      comment_id: testId,
      body: newCommentBody,
    });
  });

  test("400: respond with 'Bad request' if the req body is invalid or empty", async () => {
    const testPromises = [
      request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: "cats" })
        .expect(400),
      request(app).patch("/api/comments/1").send({ inc_votes: "" }).expect(400),
      request(app).patch("/api/comments/1").send({}).expect(400),
      request(app).patch("/api/comments/1").send({ pet: "dog" }).expect(400),
      request(app).patch("/api/comments/1").send({ votes: 10 }).expect(400),
    ];
    const results = await Promise.all(testPromises);
    results.forEach((res) => {
      expect(res.body.msg).toBe("Bad request");
    });
  });

  test("400: respond with 'bad request' if comment_id is invalid", async () => {
    const res = await request(app)
      .patch("/api/comments/3;DROP TABLE comments")
      .send({ inc_votes: 10 })
      .expect(400);
    expect(res.body.msg).toBe("Bad request");
  });

  test("404: respond with 'comment_id not exists' if comment_id is wellformed but not in database", async () => {
    const res = await request(app)
      .patch("/api/comments/99999")
      .send({ inc_votes: 10 })
      .expect(404);
    expect(res.body.msg).toBe("comment_id not exists");
  });
});

describe("GET /api/users", () => {
  test("200: respond with an array of usernames", async () => {
    const res = await request(app).get("/api/users").expect(200);
    expect(res.body.users).toHaveLength(4); // test data has 4 users
    res.body.users.forEach((user) => {
      expect(user).toEqual({
        username: expect.any(String),
      });
    });
  });
});

describe("POST /api/users", () => {
  test("200: responds with new user", async () => {
    const newUser = {
      username: "puppylover",
      name: "bowbow",
      avatar_url: "https://place-puppy.com/250x250",
    };

    const res = await request(app).post("/api/users").send(newUser).expect(201);
    expect(res.body.user).toMatchObject(newUser);

    const result = await db.query(
      `SELECT * FROM users WHERE username = 'puppylover';`
    );
    expect(result.rows).toHaveLength(1);
  });

  test("400: responds with 'Bad request' if `name` or `username` is missing ", async () => {
    const testuser1 = { username: "puppylover" };
    const testuser2 = { name: "bowbow" };

    for (const testuser of [testuser1, testuser2]) {
      const res = await request(app)
        .post(`/api/users`)
        .send(testuser)
        .expect(400);
      expect(res.body.msg).toBe("Bad request");
    }
  });
});

describe("GET /api/users/:username", () => {
  test("200: respond with a user object", async () => {
    const testUsername = "bainesface";
    const res = await request(app)
      .get(`/api/users/${testUsername}`)
      .expect(200);

    expect(res.body.user).toEqual({
      username: testUsername,
      name: expect.any(String),
      avatar_url: expect.any(String),
    });
  });

  test("404: respond with 'username not exists' when given an invalid username", async () => {
    const testUsername = `nobody OR 1=1`;
    const res = await request(app)
      .get(`/api/users/${testUsername}`)
      .expect(404);
    expect(res.body.msg).toBe("username not exists");
  });
});
