const express = require("express");
const healthRouter = express.Router();

healthRouter.get("/", async (req, res) => {
  // res.send("The server is healthy");
  res.send({
    message: "The server is healthy",
  });
});

module.exports = healthRouter;
