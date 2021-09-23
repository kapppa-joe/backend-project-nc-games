const catchAndLogAllErrors = (err, req, res, next) => {
  // for debug purpose only. disabled in normal situation.
  console.error(err);
  next(err);
};

const handle404Error = (req, res, next) => {
  res.status(404).send({ msg: "Not found" });
};

const handlePsql400Errors = (err, req, res, next) => {
  const errorCodesToHandle = [
    "22P02",
    "23502",
    "23503",
    "2201X",
    "2201W",
    "23502",
  ];
  if (errorCodesToHandle.includes(err.code)) {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
};

const handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

const handle500Errors = (err, req, res, next) => {
  console.log(`error caught when handling req: ${req.method}, ${req.url}`);
  console.error(err);
  res.status(500).send({ msg: "Internal Server Error" });
};

const errorHandlers = [
  // catchAndLogError,
  handlePsql400Errors,
  handleCustomErrors,
  handle500Errors,
];

exports.applyErrorHandlers = (app) => {
  for (const errorHandler of errorHandlers) {
    app.use(errorHandler);
  }
  app.all("*", handle404Error);
  return app;
};
