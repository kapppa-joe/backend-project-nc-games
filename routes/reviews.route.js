const reviewsRouter = require("express").Router();
const {
  getReviews,
  postReview,
  getReviewById,
  patchReviewById,
  removeReviewById,
} = require("../controllers/reviews.controller.js");

const {
  getCommentsByReviewId,
  postCommentByReviewId,
} = require("../controllers/comments.controller");

const { respondsWith405 } = require("../controllers/api.controller");

reviewsRouter.route("/").get(getReviews).post(postReview).all(respondsWith405);

reviewsRouter
  .route("/:review_id")
  .get(getReviewById)
  .patch(patchReviewById)
  .delete(removeReviewById)
  .all(respondsWith405);

reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postCommentByReviewId)
  .all(respondsWith405);

module.exports = reviewsRouter;
