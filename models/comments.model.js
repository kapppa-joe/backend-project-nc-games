const db = require("../db");

async function validateReviewId(review_id) {
  const result = await db.query(
    `SELECT review_id FROM reviews 
     WHERE review_id = $1`,
    [review_id]
  );
  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "review_id not exists" });
  }
}

exports.selectCommentsByReviewId = async (review_id) => {
  const sqlQuery = {
    text: `
      SELECT * FROM comments
      WHERE review_id = $1
      `,
    values: [review_id],
  };
  const result = await db.query(sqlQuery);
  if (result.rows.length === 0) {
    await validateReviewId(review_id);
  }

  return result.rows;
};
