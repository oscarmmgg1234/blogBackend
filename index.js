const express = require("express");
const server = express();
const cors = require("cors");
const router = require("./src/routes/endpoints");


const corsOptions = {
  origin: "https://oscarmmgg1234.github.io", // Replace with the origin you want to allow
  optionsSuccessStatus: 200, // For legacy browser support
};

server.use(cors(corsOptions));
server.use(express.json());
server.use(router);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
