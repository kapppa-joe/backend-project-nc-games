const db = require("../db");

exports.selectUsers = async () => {
  const sqlQuery = `
    SELECT username FROM users;
  `;
  const result = await db.query(sqlQuery);
  return result.rows;
};

exports.selectUserByUsername = async (username) => {
  const sqlQuery = {
    text: `
    SELECT * FROM users
    WHERE username = $1;
    `,
    values: [username],
  };
  const result = await db.query(sqlQuery);
  return result.rows[0];
};
