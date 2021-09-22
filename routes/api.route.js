const apiRouter = require("express").Router();
const listEndpoints = require("express-list-endpoints");

const categoriesRouter = require("./categories.route");
const reviewsRouter = require("./reviews.route");

apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/reviews", reviewsRouter);

apiRouter.get("/", getAllEndpoints);

function getAllEndpoints(req, res, next) {
  const endPoints = listEndpoints(apiRouter);
  endPoints.forEach((obj) => delete obj.middlewares);
  res.status(200).send(endPoints);
}

module.exports = apiRouter;
