const { fetchReviewById } = require("../models/reviews.model.js");

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
