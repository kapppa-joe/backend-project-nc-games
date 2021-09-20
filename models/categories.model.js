const db = require("../db");

exports.fetchCategories = async () => {
  const sqlQuery = `SELECT * FROM categories;`;
  const result = await db.query(sqlQuery);
  return result.rows;
};
