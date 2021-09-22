const db = require("../db");

exports.selectUsers = async () => {
  const sqlQuery = `
    SELECT username FROM USERS;
  `;
  const result = await db.query(sqlQuery);
  return result.rows;
};
