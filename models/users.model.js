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
  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "username not exists" });
  } else {
    return result.rows[0];
  }
};

exports.insertUser = async (newUser) => {
  const { username, name, avatar_url } = newUser;
  const sqlQuery = {
    text: `INSERT INTO users
       (username, name, avatar_url)
       VALUES
       ($1, $2, $3)
       RETURNING * ;`,
    values: [username, name, avatar_url],
  };

  const result = await db.query(sqlQuery);
  return result.rows[0];
};
