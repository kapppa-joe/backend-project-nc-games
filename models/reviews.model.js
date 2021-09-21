const db = require("../db");
const { fetchCategories } = require("./categories.model.js");

exports.fetchReviewById = async (review_id) => {
  const sqlQuery = {
    text: `
        SELECT reviews.*, COUNT(comment_id) :: INT as comment_count 
          FROM reviews LEFT OUTER JOIN comments
          ON reviews.review_id = comments.review_id
        WHERE reviews.review_id = $1
        GROUP BY reviews.review_id;
    `,
    values: [review_id],
  };
  const result = await db.query(sqlQuery);
  return result.rows[0];
};

exports.updateReviewById = async (review_id, inc_votes) => {
  if (isNaN(parseInt(inc_votes))) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  const reviewBeforePatch = await this.fetchReviewById(review_id);
  if (!reviewBeforePatch) {
    return Promise.reject({ status: 404, msg: "review_id not exists" });
  }

  const { votes: currentVotes } = reviewBeforePatch;
  const newVotes = currentVotes + inc_votes;

  const sqlQuery = {
    text: `
      UPDATE reviews
      SET votes = $1
      WHERE review_id = $2
      RETURNING * ;
    `,
    values: [newVotes, review_id],
  };

  const result = await db.query(sqlQuery);
  return result.rows[0];
};

function isValidColumn(column) {
  const validColumns = [
    "owner",
    "title",
    "review_id",
    "category",
    "review_img_url",
    "created_at",
    "votes",
    "comment_count",
  ];
  return validColumns.includes(column);
}

function isValidOrder(order) {
  return ["asc", "desc"].includes(order.toLowerCase());
}

async function validateCategory(slug) {
  const validCategories = await fetchCategories();
  const validSlugs = validCategories.map((category) => category.slug);
  if (!validSlugs.includes(slug)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
}

exports.selectReviews = async ({
  sort_by = "created_at",
  order = "desc",
  category = undefined,
}) => {
  if (!isValidColumn(sort_by) || !isValidOrder(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  if (category) {
    await validateCategory(category);
  }

  const sqlQuery = {
    text: `
      SELECT 
        reviews.owner
        , reviews.title
        , reviews.review_id
        , reviews.category
        , reviews.review_img_url
        , reviews.created_at
        , reviews.votes
        , COUNT(comment_id) :: INT as comment_count
      FROM reviews LEFT OUTER JOIN comments
        ON reviews.review_id = comments.review_id
      GROUP BY reviews.review_id
      ORDER BY ${sort_by} ${order}
    `,
  };

  if (category) {
    sqlQuery.text = sqlQuery.text.replace(
      "GROUP BY",
      `WHERE reviews.category = $1 \n GROUP BY`
    );
    sqlQuery.values = [category];
  }

  const result = await db.query(sqlQuery);
  return result.rows;
};
