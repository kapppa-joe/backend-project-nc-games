const reviewsRouter = require("express").Router();
const {
  getReviewById,
  patchReviewById,
} = require("../controllers/reviews.controller.js");

reviewsRouter.route("/:review_id").get(getReviewById).patch(patchReviewById);

module.exports = reviewsRouter;
