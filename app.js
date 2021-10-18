const express = require("express");
const cors = require("cors");

const app = express();
const apiRouter = require("./routes/api.route");
const { applyErrorHandlers } = require("./errors");

app.use(cors());
app.use(express.json());
app.use("/api", apiRouter);

applyErrorHandlers(app);

module.exports = app;
