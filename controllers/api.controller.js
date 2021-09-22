const listEndpoints = require("express-list-endpoints");

exports.getAllEndpoints = (router) => (req, res, next) => {
  const hostname = req.get("host");
  const endPoints = listEndpoints(router);
  endPoints.forEach((obj) => {
    obj.path = `/api${obj.path}`;
    obj.url = `http://${hostname}${obj.path}`;
    delete obj.middlewares;
  });
  endPoints.sort((a, b) => a.path.localeCompare(b.path));
  res.status(200).send({ endPoints });
};
