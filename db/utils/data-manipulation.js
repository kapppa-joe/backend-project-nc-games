const format = require("pg-format");

function mapDataToNestedArray(columns, dataArray) {
  return dataArray.map((obj) => columns.map((column) => obj[column]));
}

function createInsertQuery(tableName, dataArray) {
  if (tableName === "" || dataArray.length === 0) {
    return "";
  }

  const columns = Object.keys(dataArray[0]);
  const sqlQuery = format(
    `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES %L RETURNING *;`,
    mapDataToNestedArray(columns, dataArray)
  );

  return sqlQuery;
}

module.exports = { mapDataToNestedArray, createInsertQuery };
