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

exports.insertCommentByReviewId = async (review_id, newComment) => {
  const { username: author, body } = newComment;
  const sqlQuery = {
    text: `
      INSERT INTO comments
        (review_id, author, body)
      VALUES
        ($1, $2, $3)
      RETURNING * ;
    `,
    values: [review_id, author, body],
  };

  const result = await db.query(sqlQuery);
  return result.rows[0];
};

exports.deleteCommentById = async (comment_id) => {
  const sqlQuery = {
    text: `
      DELETE FROM comments
      WHERE comment_id = $1
      RETURNING *;
    `,
    values: [comment_id],
  };

  const result = await db.query(sqlQuery);
  return result.rows[0];
};

exports.selectCommentById = async (comment_id) => {
  const sqlQuery = {
    text: `
      SELECT * FROM comments 
      WHERE comment_id = $1
    `,
    values: [comment_id],
  };
  const result = await db.query(sqlQuery);
  return result.rows[0];
};

exports.updateCommentById = async (comment_id, { inc_votes, body }) => {
  if (inc_votes && body) {
    return Promise.reject({
      status: 400,
      msg: "Bad request",
      detail: "Cannot update votes & body in the same request.",
    });
  } else if (inc_votes) {
    return updateCommentVotes(comment_id, inc_votes);
  } else if (body) {
    return updateCommentBody(comment_id, body);
  } else {
    return Promise.reject({
      status: 400,
      msg: "Bad request",
      detail: "property `inc_votes` or `body` not found in request body.",
    });
  }
};

async function updateCommentBody(comment_id, body) {
  const sqlQuery = {
    text: `UPDATE comments
           SET body = $1
           WHERE comment_id = $2
           RETURNING *;`,
    values: [body, comment_id],
  };
  const result = await db.query(sqlQuery);
  if (result.rows.length) {
    return result.rows[0];
  } else {
    return Promise.reject({ status: 404, msg: "comment_id not exists" });
  }
}

async function updateCommentVotes(comment_id, inc_votes) {
  if (isNaN(parseInt(inc_votes))) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  const sqlQuery = {
    text: `
      UPDATE comments
        SET votes = votes + $1
      WHERE comment_id = $2
      RETURNING * ;
    `,
    values: [inc_votes, comment_id],
  };
  const result = await db.query(sqlQuery);

  return result.rows[0];
}
