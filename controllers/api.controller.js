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

exports.respondsWith405 = (req, res, next) => {
  const methodsAllowed = Object.entries(req.route.methods)
    .filter(([method, isAllowed]) => method !== "_all" && isAllowed)
    .map(([method, isAllowed]) => method.toUpperCase());

  res
    .status(405)
    .set("Allow", methodsAllowed) // set an `Allow` header for valid methods.
    .send({ msg: "Method not allowed" });
};
