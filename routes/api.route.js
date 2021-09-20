const apiRouter = require("express").Router();
const categoriesRouter = require("./categories.route");
const reviewsRouter = require("./reviews.route");

apiRouter.use("/categories", categoriesRouter);
apiRouter.use("reviews", reviewsRouter);

module.exports = apiRouter;
