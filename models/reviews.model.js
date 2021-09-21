const db = require("../db");

exports.fetchReviewById = async (review_id) => {
  const sqlQuery = {
    text: `
        SELECT reviews.*, COUNT(comment_id) :: INT as comment_count 
          FROM reviews INNER JOIN comments
          ON reviews.review_id = comments.review_id
        WHERE reviews.review_id = $1
        GROUP BY reviews.review_id;
    `,
    values: [review_id],
  };
  const result = await db.query(sqlQuery);
  return result.rows[0];
};
