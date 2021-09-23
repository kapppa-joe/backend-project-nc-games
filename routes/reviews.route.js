const reviewsRouter = require("express").Router();
const {
  getReviewById,
  patchReviewById,
  getReviews,
  postReview,
} = require("../controllers/reviews.controller.js");

const {
  getCommentsByReviewId,
  postCommentByReviewId,
} = require("../controllers/comments.controller");

reviewsRouter.route("/").get(getReviews).post(postReview);
reviewsRouter.route("/:review_id").get(getReviewById).patch(patchReviewById);
reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postCommentByReviewId);

module.exports = reviewsRouter;
