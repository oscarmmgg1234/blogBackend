const express = require("express");
const server = express();
const cors = require("cors");
const router = require("./src/routes/endpoints");

server.use(cors());
server.use(express.json());
server.use(router);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
