// const listEndpoints = require("express-list-endpoints");
const { readFile } = require("fs/promises");
const filePath = "./endpoints.json";

exports.getAllEndpoints = (router) => (req, res, next) => {
  readFile(filePath, "utf-8")
    .then((fileContent) => {
      res.status(200).send(JSON.parse(fileContent));
    })
    .catch(next);
};
