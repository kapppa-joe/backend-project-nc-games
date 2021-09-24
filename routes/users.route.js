const usersRouter = require("express").Router();
const {
  getUsers,
  getUserByUsername,
} = require("../controllers/users.controller");

const { respondsWith405 } = require("../controllers/api.controller");

usersRouter.route("/").get(getUsers).all(respondsWith405);

usersRouter.route("/:username").get(getUserByUsername).all(respondsWith405);

module.exports = usersRouter;
