const reviewsRouter = require("express").Router();
const { getReviewById } = require("../controllers/reviews.controller.js");

reviewsRouter.get("/:review_id", getReviewById);

module.exports = reviewsRouter;
