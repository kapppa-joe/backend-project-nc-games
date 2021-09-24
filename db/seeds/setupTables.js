const format = require("pg-format");
const db = require("../index.js");

const { createInsertQuery } = require("../utils/data-manipulation");

async function setupCategoriesTable(categoryData) {
  await db.query(`
    DROP TABLE IF EXISTS categories CASCADE;
    CREATE TABLE categories (
      slug VARCHAR(255) PRIMARY KEY,
      description TEXT NOT NULL
    );
  `);

  const sqlQuery = createInsertQuery("categories", categoryData);
  const result = await db.query(sqlQuery);
  return result.rows;
}

async function setupUsersTable(userData) {
  await db.query(`
    DROP TABLE IF EXISTS users CASCADE;
    CREATE TABLE users (
      username VARCHAR(255) PRIMARY KEY,
      avatar_url VARCHAR(255),
      name VARCHAR(255) NOT NULL
    );
  `);
  const sqlQuery = createInsertQuery("users", userData);
  const result = await db.query(sqlQuery);
  return result.rows;
}

async function setupReviewsTable(reviewData) {
  await db.query(`
    DROP TABLE IF EXISTS reviews CASCADE;
    CREATE TABLE reviews (
      review_id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      review_body text NOT NULL,
      designer VARCHAR(255),
      review_img_url VARCHAR(255) DEFAULT 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
      votes INTEGER NOT NULL DEFAULT 0,
      category VARCHAR(255) NOT NULL,
      owner VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      FOREIGN KEY (category) 
        REFERENCES categories(slug)
        ON DELETE CASCADE,
      FOREIGN KEY (owner) 
        REFERENCES users(username)
        ON DELETE CASCADE
    );`);
  const sqlQuery = createInsertQuery("reviews", reviewData);
  const result = await db.query(sqlQuery);
  return result.rows;
}

async function setupCommentsTable(commentData) {
  await db.query(`
      DROP TABLE IF EXISTS comments;
      CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        author VARCHAR(255) NOT NULL, 
        review_id INT NOT NULL,
        votes INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        body text NOT NULL,
        FOREIGN KEY(review_id)
          REFERENCES reviews(review_id)
          ON DELETE CASCADE,
        FOREIGN KEY (author)
          REFERENCES users(username) 
          ON DELETE CASCADE
      );`);

  const sqlQuery = createInsertQuery("comments", commentData);
  const result = await db.query(sqlQuery);
  return result.rows;
}

module.exports = {
  setupCategoriesTable,
  setupUsersTable,
  setupReviewsTable,
  setupCommentsTable,
};
