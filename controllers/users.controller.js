const {
  selectUsers,
  selectUserByUsername,
  insertUser,
} = require("../models/users.model");

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
      res.status(200).send({ user });
    })
    .catch(next);
};

exports.postUser = (req, res, next) => {
  const newUser = req.body;
  insertUser(newUser)
    .then((user) => {
      res.status(201).send({ user });
    })
    .catch(next);
};
