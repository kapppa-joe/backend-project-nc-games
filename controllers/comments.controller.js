const {
  selectCommentsByReviewId,
  insertCommentByReviewId,
  deleteCommentById,
  updateCommentById,
} = require("../models/comments.model");

exports.getCommentsByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  selectCommentsByReviewId(review_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  const newComment = req.body;
  insertCommentByReviewId(review_id, newComment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.removeCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  deleteCommentById(comment_id)
    .then((result) => {
      if (result) {
        res.status(204).send({});
      } else {
        return Promise.reject({ status: 404, msg: "comment_id not exists" });
      }
    })
    .catch(next);
};

exports.patchCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  updateCommentById(comment_id, inc_votes)
    .then((comment) => {
      if (comment) {
        res.status(200).send({ comment });
      } else {
        return Promise.reject({ status: 404, msg: "comment_id not exists" });
      }
    })
    .catch(next);
};
