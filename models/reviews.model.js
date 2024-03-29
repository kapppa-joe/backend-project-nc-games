const db = require("../db");
const { fetchCategories } = require("./categories.model.js");
const format = require("pg-format");

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
  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "review_id not exists" });
  } else {
    return result.rows[0];
  }
};

exports.updateReviewById = async (
  review_id,
  { inc_votes, username, review_body }
) => {
  if (inc_votes && review_body) {
    return Promise.reject({
      status: 400,
      msg: "Bad request",
      details:
        "`inc_votes` and `review_body` cannot be handled in the same request.",
    });
  } else if (inc_votes) {
    return updateReviewVotesById(review_id, inc_votes);
  } else if (review_body) {
    return updateReviewBody(review_id, username, review_body);
  } else {
    return Promise.reject({
      status: 400,
      msg: "Bad request",
      details:
        "property `inc_votes` or `review_body` not found in request body.",
    });
  }
};

async function updateReviewBody(review_id, username, review_body) {
  const sqlQuery = {
    text: `UPDATE reviews
           SET review_body = $1
           WHERE review_id = $2 AND owner = $3
           RETURNING *;`,
    values: [review_body, review_id, username],
  };
  const result = await db.query(sqlQuery);
  if (result.rows.length === 0) {
    return Promise.reject({
      status: 404,
      msg: "review_id not exists or username not matching review author.",
    });
  } else {
    return result.rows[0];
  }
}

async function updateReviewVotesById(review_id, inc_votes) {
  if (isNaN(parseInt(inc_votes))) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  const sqlQuery = {
    text: `
      UPDATE reviews
      SET votes = votes + $1
      WHERE review_id = $2
      RETURNING * ;
    `,
    values: [inc_votes, review_id],
  };

  const result = await db.query(sqlQuery);

  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "review_id not exists" });
  } else {
    return result.rows[0];
  }
}

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
    return Promise.reject({
      status: 404,
      msg: "Not found",
      detail: "The requested category is not found in database",
    });
  }
}

function validateLimitAndPage(limit, p) {
  if (isNaN(parseInt(p)) || isNaN(parseInt(limit))) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
}

async function getTotalCounts(whereClauses, values) {
  const totalCountQuery = {
    text: `SELECT COUNT(review_id)::INT as total_count FROM reviews`,
  };
  const newWhereClause = whereClauses
    .join(" AND ")
    .replace(/(\$\d+)/g, (arg) => `$${parseInt(arg.slice(1)) - 2}`);

  if (whereClauses.length > 0) {
    totalCountQuery.text += ` WHERE ${newWhereClause} `;
    totalCountQuery.values = values.slice(2);
  }
  // console.log(totalCountQuery, "<--- totalCountQuery");

  const result = await db.query(totalCountQuery);
  return result.rows[0].total_count;
}

exports.selectReviews = async ({
  sort_by = "created_at",
  order = "desc",
  category = undefined,
  search = undefined,
  limit = 10,
  p = 1,
}) => {
  if (!isValidColumn(sort_by) || !isValidOrder(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  if (category) {
    await validateCategory(category);
  }

  await validateLimitAndPage(limit, p);
  const offset = (p - 1) * limit;

  // cast varChar columns to bytea when sorting, so that psql sort like what js expects
  const varCharColumns = ["title", "owner", "category", "review_img_url"];
  if (varCharColumns.includes(sort_by)) {
    sort_by = `${sort_by}::bytea`;
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
        ${search ? ", reviews.review_body" : ""}
        , COUNT(comment_id) :: INT as comment_count
      FROM reviews LEFT OUTER JOIN comments
        ON reviews.review_id = comments.review_id
      GROUP BY reviews.review_id
      ORDER BY ${sort_by} ${order}
      LIMIT $1 OFFSET $2
    `,
    values: [limit, offset],
  };

  const whereClauses = [];
  if (category || search) {
    // const whereClauses = [];
    if (category) {
      whereClauses.push(` reviews.category = $${sqlQuery.values.length + 1} `);
      sqlQuery.values.push(category);
    }
    if (search) {
      const keywords = search.split(" ");
      for (const keyword of keywords) {
        whereClauses.push(
          ` CONCAT(reviews.title, ' ', reviews.review_body,' ', reviews.category) ILIKE $${
            sqlQuery.values.length + 1
          } `
        );
        sqlQuery.values.push(`%${keyword}%`);
      }
    }

    sqlQuery.text = sqlQuery.text.replace(
      "GROUP BY",
      `WHERE ${whereClauses.join(" AND ")} \n GROUP BY`
    );
  }

  const result = await db.query(sqlQuery);
  const total_count = await getTotalCounts(whereClauses, sqlQuery.values);

  return { reviews: result.rows, total_count: total_count };
};

function validateReview(review) {
  const validColoumns = [
    "owner",
    "title",
    "review_body",
    "designer",
    "category",
    "review_img_url",
  ];
  const requiredColoumns = ["owner", "title", "review_body", "category"];

  const allColoumnsAreValid = Object.keys(review).every((key) =>
    validColoumns.includes(key)
  );
  const gotAllRequiredColoumns = requiredColoumns.every((key) => key in review);

  const isValidReview = allColoumnsAreValid && gotAllRequiredColoumns;

  if (!isValidReview) {
    return Promise.reject({
      status: 400,
      msg: "Bad request",
      detail: "The new review object is not valid.",
    });
  }
}

exports.insertReview = async (newReview) => {
  await validateReview(newReview);
  const columnsToInsert = Object.keys(newReview);

  const sqlQuery = format(
    `
      INSERT INTO reviews
        (${columnsToInsert.join(", ")})
      VALUES
        %L
      RETURNING *;
    `,
    [columnsToInsert.map((key) => newReview[key])]
  );

  const result = await db.query(sqlQuery);
  const new_review_id = result.rows[0].review_id;
  return this.fetchReviewById(new_review_id);
};

exports.deleteReviewById = async (review_id) => {
  const sqlQuery = {
    text: `DELETE FROM reviews 
           WHERE review_id = $1
           RETURNING * ;`,
    values: [review_id],
  };

  const result = await db.query(sqlQuery);
  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "review_id not exists" });
  }
};
