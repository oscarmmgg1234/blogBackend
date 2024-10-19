const express = require("express");
const router = express.Router();
const { controller } = require("../controller");

const Controller = controller.getInstance();

router.get("/entries", async (req, res) => {
  try {
    res.send(await Controller._getEntries());
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/entry/:id", async (req, res) => {
  try {
    const param = req.params.id;
    res.send(await Controller._getEntry(param));
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
