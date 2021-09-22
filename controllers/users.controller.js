const { selectUsers, selectUserByUsername } = require("../models/users.model");

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  selectUserByUsername(username)
    .then((user) => {
      if (user) {
        res.status(200).send({ user });
      } else {
        return Promise.reject({ status: 404, msg: "username not exists" });
      }
    })
    .catch(next);
};
