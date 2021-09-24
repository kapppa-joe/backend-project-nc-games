const categoriesRouter = require("express").Router();

const { getCategories } = require("../controllers/categories.controller.js");

const { respondsWith405 } = require("../controllers/api.controller");

categoriesRouter.route("/").get(getCategories).all(respondsWith405);

module.exports = categoriesRouter;
