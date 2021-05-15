require("dotenv").config();
const express = require("express");
const server = express();
const morgan = require("morgan");
const cors = require("cors");
const { PORT = 3000 } = process.env;
const client = require("./db/client");
client.connect();
server.use(cors());

server.use(morgan("dev"));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const path = require("path");
server.use("/docs", express.static(path.join(__dirname, "public")));

server.use("/api", require("./api"));
server.get("/", (req, res) => {
  res.redirect("/docs");
});

server.get("*", (req, res) => {
  res
    .status(404)
    .send({
      error: "404 - Not Found",
      message: "No route found for the requested URL",
    });
});

server.use((error, req, res, next) => {
  console.error("SERVER ERROR: ", error);
  if (res.statusCode < 400) res.status(500);
  res.send({
    error: error.message,
    name: error.name,
    message: error.message,
    table: error.table,
  });
});
server.listen(PORT, () => {
  console.log(`Server is listening on PORT: ${PORT}`);
});
