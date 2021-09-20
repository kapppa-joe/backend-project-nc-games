const db = require("../db");

exports.fetchReviewById = async (review_id) => {
  const sqlQuery = {
    text: `
        SELECT * FROM reviews
        WHERE review_id = $1
    `,
    values: [review_id],
  };
  const result = await db.query(sqlQuery);
  return result.rows[0];
};
