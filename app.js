const express = require("express");

const app = express();
const apiRouter = require("./routes/api.route");
const { applyErrorHandlers } = require("./errors");

app.use(express.json());
app.use("/api", apiRouter);

applyErrorHandlers(app);

module.exports = app;
