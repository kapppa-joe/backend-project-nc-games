const reviewsRouter = require("express").Router();
const {
  getReviewById,
  patchReviewById,
  getReviews,
} = require("../controllers/reviews.controller.js");

const { getCommentsByReviewId } = require("../controllers/comments.controller");

reviewsRouter.route("/").get(getReviews);
reviewsRouter.route("/:review_id").get(getReviewById).patch(patchReviewById);
reviewsRouter.route("/:review_id/comments").get(getCommentsByReviewId);

module.exports = reviewsRouter;
