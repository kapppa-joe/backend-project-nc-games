const errorHandlers = {};

errorHandlers.handlePsql400Error = (err, req, res, next) => {
  const errorCodesToHandle = ["22P02"];
  if (errorCodesToHandle.includes(err.code)) {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
};

errorHandlers.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

errorHandlers.handle500Errors = (err, req, res, next) => {
  console.log(`error caught at handling req: ${req.method}, ${req.url}`);
  console.error(err);
  res.status(500).send({ msg: "Internal Server Error" });
};

exports.applyErrorHandlers = (app) => {
  for (const key in errorHandlers) {
    console.log(key);
    app.use(errorHandlers[key]);
  }
  return app;
};
