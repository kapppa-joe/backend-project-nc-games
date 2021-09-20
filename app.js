const express = require("express");

const app = express();
app.use(express.json());

const { getCategories } = require("./controllers/categories.controller.js");

app.get("/api/categories", getCategories);

app.use((err, req, res, next) => {
  console.log(`error caught at handling req: ${req.method}, ${req.url}`);
  console.error(err);
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
