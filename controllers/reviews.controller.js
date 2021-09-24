const {
  fetchReviewById,
  updateReviewById,
  selectReviews,
  insertReview,
} = require("../models/reviews.model.js");

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  fetchReviewById(review_id)
    .then((review) => {
      if (review) {
        res.status(200).send({ review });
      } else {
        return Promise.reject({ status: 404, msg: "review_id not exists" });
      }
    })
    .catch(next);
};

exports.patchReviewById = (req, res, next) => {
  const { review_id } = req.params;
  const { inc_votes } = req.body;

  updateReviewById(review_id, inc_votes)
    .then((review) => {
      if (review) {
        res.status(200).send({ review });
      } else {
        return Promise.reject({ status: 404, msg: "review_id not exists" });
      }
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
