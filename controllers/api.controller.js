// const listEndpoints = require("express-list-endpoints");
const { readFile } = require("fs/promises");
const filePath = "./endpoints.json";

exports.getAllEndpoints = (req, res, next) => {
  readFile(filePath, "utf-8")
    .then((fileContent) => {
      res.status(200).send(JSON.parse(fileContent));
    })
    .catch(next);
};

// exports.respondsWith405MethodNotAllow = (req, res, next) => {};
