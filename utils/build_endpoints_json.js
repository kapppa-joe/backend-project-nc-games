const listEndpoints = require("express-list-endpoints");
const { readFile, writeFile } = require("fs/promises");

const app = require("../app");
const request = require("supertest");

const jsonPath = "./endpoints.json";

async function generateExampleResponse(endpoint) {
  let [method, path] = endpoint.split(" ");
  path = path.replace(/:\w+id/, "1");
  path = path.replace(/:username/, "tickle122");
  if (method !== "GET") {
    return null; // do those manually.
  }

  const res = await request(app).get(path);
  if (Object.keys(res.body).length > 0) {
    return res.body;
  } else {
    return null;
  }
}

async function build() {
  const pathsAndMethods = listEndpoints(app)
    .filter((obj) => obj.path !== "*")
    .sort((a, b) => a.path.localeCompare(b.path));

  const currentEndpoints = [];
  for (const { path, methods } of pathsAndMethods) {
    for (const method of methods) {
      currentEndpoints.push(`${method} ${path}`);
    }
  }

  const previousVersion = await readFile(jsonPath, "utf-8").then(
    (fileContent) => JSON.parse(fileContent)
  );

  const updatedJson = currentEndpoints.reduce((obj, endpoint) => {
    if (endpoint in previousVersion) {
      obj[endpoint] = previousVersion[endpoint];
    } else {
      obj[endpoint] = {
        description: "",
        queries: [],
        exampleResponse: null,
      };
    }
    return obj;
  }, {});

  for (const endpoint of Object.keys(updatedJson)) {
    if (updatedJson[endpoint].exampleResponse === null) {
      updatedJson[endpoint].exampleResponse = await generateExampleResponse(
        endpoint
      );
    }
  }
  await writeFile(jsonPath, JSON.stringify(updatedJson, null, 2));
  console.log("Done.");
}

build();

// getAllEndpoints = (router) => (req, res, next) => {
//   const hostname = req.get("host");
//   const endPoints = listEndpoints(router);
//   endPoints.forEach((obj) => {
//     obj.path = `/api${obj.path}`;
//     obj.url = `http://${hostname}${obj.path}`;
//     delete obj.middlewares;
//   });
//   endPoints.sort((a, b) => a.path.localeCompare(b.path));
//   res.status(200).send({ endPoints });
// };
