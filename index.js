const express = require("express");
const server = express();
const cors = require("cors");
const router = require("./src/routes/endpoints");


server.use(
  cors({
    origin: "https://oscarmmgg1234.github.io", // Change this to the correct origin
    methods: "GET, POST, PUT, DELETE", // Specify allowed methods
    optionsSuccessStatus: 200, // Some browsers (legacy) choke on 204
  })
);

server.use(express.json());
server.use(router);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
