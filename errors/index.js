exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handle500Errors = (err, req, res, next) => {
  console.log(`error caught at handling req: ${req.method}, ${req.url}`);
  console.error(err);
  res.status(500).send({ msg: "Internal Server Error" });
};
