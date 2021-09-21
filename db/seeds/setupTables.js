const format = require("pg-format");
const db = require("../index.js");

async function setupCategoriesTable(categoryData) {
  await db.query(`
    DROP TABLE IF EXISTS categories CASCADE;
    CREATE TABLE categories (
      slug VARCHAR(255) PRIMARY KEY,
      description TEXT NOT NULL
    );
  `);
  const result = await db.query(
    format(
      `
    INSERT INTO categories 
      (slug, description)
    VALUES
      %L
    RETURNING *;
  `,
      categoryData.map((category) => [category.slug, category.description])
    )
  );
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
  const result = await db.query(
    format(
      `
    INSERT INTO users
      (username, avatar_url, name)
    VALUES
      %L
    RETURNING *;
  `,
      userData.map((user) => [user.username, user.avatar_url, user.name])
    )
  );
  return result.rows;
}

async function setupReviewsTable(reviewData) {
  await db.query(`
    DROP TABLE IF EXISTS reviews CASCADE;
    CREATE TABLE reviews (
      review_id SERIAL PRIMARY KEY,
      title VARCHAR(255) COLLATE "C", -- to make psql sort like js.
      review_body text NOT NULL,
      designer VARCHAR(255),
      review_img_url VARCHAR(255) DEFAULT 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
      votes INTEGER DEFAULT 0,
      category VARCHAR(255) NOT NULL,
      owner VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      FOREIGN KEY (category) 
        REFERENCES categories(slug)
        ON DELETE CASCADE,
      FOREIGN KEY (owner) 
        REFERENCES users(username)
        ON DELETE CASCADE
    );`);
  const reviewProps = Object.keys(reviewData[0]);
  const results = await db.query(
    format(
      `
    INSERT INTO reviews
      (${reviewProps.join(", ")})
    VALUES
      %L
    RETURNING * ;
      `,
      reviewData.map((review) => {
        return reviewProps.map((key) => review[key]);
      })
    )
  );
  return results.rows;
}

async function setupCommentsTable(commentData) {
  await db.query(`
      DROP TABLE IF EXISTS comments;
      CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        author VARCHAR(255) NOT NULL, 
        review_id INT NOT NULL,
        votes INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        body text NOT NULL,
        FOREIGN KEY(review_id)
          REFERENCES reviews(review_id)
          ON DELETE CASCADE,
        FOREIGN KEY (author)
          REFERENCES users(username) 
          ON DELETE CASCADE
      );`);
  const commentProps = Object.keys(commentData[0]);
  const results = await db.query(
    format(
      `
      INSERT INTO comments
        (${commentProps.join(", ")})
      VALUES
        %L
      RETURNING * ;
        `,
      commentData.map((comment) => {
        return commentProps.map((key) => comment[key]);
      })
    )
  );
  return results.rows;
}

module.exports = {
  setupCategoriesTable,
  setupUsersTable,
  setupReviewsTable,
  setupCommentsTable,
};
