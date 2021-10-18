const usersRouter = require("express").Router();
const {
  getUsers,
  getUserByUsername,
  postUser,
} = require("../controllers/users.controller");

const { respondsWith405 } = require("../controllers/api.controller");

usersRouter.route("/").get(getUsers).post(postUser).all(respondsWith405);

usersRouter.route("/:username").get(getUserByUsername).all(respondsWith405);

module.exports = usersRouter;
