const apiRouter = require("express").Router();

const categoriesRouter = require("./categories.route");
const reviewsRouter = require("./reviews.route");
const commentsRouter = require("./comments.route");
const usersRouter = require("./users.route");

const { getAllEndpoints } = require("../controllers/api.controller");

apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);

apiRouter.get("/", getAllEndpoints(apiRouter));

module.exports = apiRouter;
