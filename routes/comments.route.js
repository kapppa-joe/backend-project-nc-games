const commentsRouter = require("express").Router();

const {
  removeCommentById,
  patchCommentById,
} = require("../controllers/comments.controller");

const { respondsWith405 } = require("../controllers/api.controller");

commentsRouter
  .route("/:comment_id")
  .delete(removeCommentById)
  .patch(patchCommentById)
  .all(respondsWith405);

module.exports = commentsRouter;
