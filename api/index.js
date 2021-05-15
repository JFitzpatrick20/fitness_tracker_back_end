const client = require("../db/client");
const express = require("express");
const apiRouter = express.Router();

const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");
const { JWT_SECRET } = process.env;

apiRouter.get("/health", async (req, res, next) => {
  try {
    const uptime = process.uptime();
    const {
      rows: [dbConnection],
    } = await client.query("SELECT NOW();");
    const currentTime = new Date();
    const lastRestart = new Intl.DateTimeFormat("en", {
      timeStyle: "long",
      dateStyle: "long",
      timeZone: "America/Los_Angeles",
    }).format(currentTime - uptime * 1000);
    res.send({
      message: "healthy",
      uptime,
      dbConnection,
      currentTime,
      lastRestart,
    });
  } catch (err) {
    next(err);
  }
});

apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);
  }

  next();
});

const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);

const activitiesRouter = require("./activities");
apiRouter.use("/activities", activitiesRouter);

const routinesRouter = require("./routines");
apiRouter.use("/routines", routinesRouter);

const healthRouter = require("./health");
apiRouter.use("/health", healthRouter);

const routine_activitiesRouter = require("./routine_activities");
apiRouter.use("/routine_activities", routine_activitiesRouter);

module.exports = apiRouter;
