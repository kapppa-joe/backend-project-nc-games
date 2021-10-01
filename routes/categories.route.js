const categoriesRouter = require("express").Router();

const {
  getCategories,
  postCategory,
} = require("../controllers/categories.controller.js");

const { respondsWith405 } = require("../controllers/api.controller");

categoriesRouter
  .route("/")
  .get(getCategories)
  .post(postCategory)
  .all(respondsWith405);

module.exports = categoriesRouter;
