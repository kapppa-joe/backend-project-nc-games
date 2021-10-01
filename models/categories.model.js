const db = require("../db");

exports.fetchCategories = async () => {
  const sqlQuery = `SELECT * FROM categories;`;
  const result = await db.query(sqlQuery);
  return result.rows;
};

function isValidCategory(category) {
  return (
    category.slug &&
    category.slug.length > 0 &&
    category.description &&
    category.description.length > 0
  );
}

exports.insertCategory = async (newCategory) => {
  if (!isValidCategory(newCategory)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request",
      detail: "new category data is incomplete",
    });
  }

  const sqlQuery = {
    text: `INSERT INTO categories
      (slug, description)
    VALUES
      ($1, $2)
    RETURNING * ;`,
    values: [newCategory.slug, newCategory.description],
  };

  const result = await db.query(sqlQuery);
  return result.rows[0];
};
