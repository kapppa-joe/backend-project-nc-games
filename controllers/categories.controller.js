const {
  fetchCategories,
  insertCategory,
} = require("../models/categories.model.js");

exports.getCategories = (req, res, next) => {
  return fetchCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch(next);
};

exports.postCategory = (req, res, next) => {
  const newCategory = req.body;
  return insertCategory(newCategory)
    .then((category) => {
      res.status(201).send({ category });
    })
    .catch(next);
};
