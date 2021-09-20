const express = require("express");

const app = express();
const apiRouter = require("./routes/api.route");
const { handle500Errors } = require("./errors");

app.use(express.json());
app.use("/api", apiRouter);

app.use(handle500Errors);

module.exports = app;
