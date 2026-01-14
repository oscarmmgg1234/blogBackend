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

//server.set("trust proxy", true);
server.use(express.json({ limit: "50mb" }));
server.use(express.urlencoded({ extended: true, limit: "50mb" }));
server.use(router);
server.get("/", (req, res) => {
  res.status(200).json({ ok: true, service: "blogbackend", time: new Date().toISOString() });
});

server.get("/health", (req, res) => {
  res.status(200).send("ok");
});
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
