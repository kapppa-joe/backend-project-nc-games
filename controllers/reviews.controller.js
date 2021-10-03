const {
  selectReviews,
  insertReview,
  fetchReviewById,
  updateReviewById,
  deleteReviewById,
} = require("../models/reviews.model.js");

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  fetchReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};

exports.patchReviewById = (req, res, next) => {
  const { review_id } = req.params;
  const { inc_votes } = req.body;

  updateReviewById(review_id, inc_votes)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};

exports.getReviews = (req, res, next) => {
  const { sort_by, order, category, limit, p } = req.query;
  selectReviews({ sort_by, order, category, limit, p })
    .then((result) => {
      const { reviews, total_count } = result;
      res.status(200).send({ reviews, total_count });
    })
    .catch(next);
};

exports.postReview = (req, res, next) => {
  const newReview = req.body;
  insertReview(newReview)
    .then((review) => {
      res.status(201).send({ review });
    })
    .catch(next);
};

exports.removeReviewById = (req, res, next) => {
  const { review_id } = req.params;
  deleteReviewById(review_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};
