const {
  setupCategoriesTable,
  setupUsersTable,
  setupReviewsTable,
  setupCommentsTable,
} = require("../db/seeds/setupTables.js");
const testData = require("../db/data/test-data");
const db = require("../db");

afterAll(() => {
  db.end();
});

describe("setup categories table", () => {
  it("create the categories table and populate with test data", () => {
    return setupCategoriesTable(testData.categoryData).then((categories) => {
      categories.forEach((category) => {
        expect(category).toMatchObject({
          slug: expect.any(String),
          description: expect.any(String),
        });
      });
    });
  });
});

describe("setup users table", () => {
  it("create the users table and populate with test data", () => {
    return setupUsersTable(testData.userData).then((users) => {
      users.forEach((user) => {
        expect(user).toMatchObject({
          username: expect.any(String),
          avatar_url: expect.any(String),
          name: expect.any(String),
        });
      });
    });
  });
});

describe("create reviews table", () => {
  it("create the reviews table and populate with test data", async () => {
    return setupReviewsTable(testData.reviewData).then((reviews) => {
      reviews.forEach((review) => {
        expect(review).toMatchObject({
          review_id: expect.any(Number),
          title: expect.any(String),
          designer: expect.any(String),
          owner: expect.any(String),
          review_img_url: expect.any(String),
          review_body: expect.any(String),
          category: expect.any(String),
          created_at: expect.any(Date),
          votes: expect.any(Number),
        });
      });
    });
  });
});

describe("create comments table", () => {
  it("create the comments table and populate with test data", () => {
    return setupCommentsTable(testData.commentData).then((comments) => {
      comments.forEach((comment) => {
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          body: expect.any(String),
          votes: expect.any(Number),
          author: expect.any(String),
          review_id: expect.any(Number),
          created_at: expect.any(Date),
        });
      });
    });
  });
});
