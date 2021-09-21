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
