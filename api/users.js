const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { requireUser } = require("./utils");
const {
  createUser,
  getUserByUsername,
  getUser,
  getPublicRoutinesByUser,
} = require("../db");
const { user } = require("../db/client");

usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const checkUser = await getUserByUsername(username);

    if (checkUser) {
      res.status(401);
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    } else if (password.length < 8) {
      res.status(401);
      next({
        name: "PasswordError",
        message: "Password must be at least 8 characters",
      });
    } else {
      const newUser = await createUser({
        username,
        password,
      });
      if (!newUser) {
        next({
          name: "Creation Error",
          message: "Unable to Create User",
        });
      } else {
        const token = jwt.sign(
          {
            id: newUser.id,
            username: newUser.username,
          },
          JWT_SECRET
        );

        res.send({
          message: "thank you for signing up",
          token: token,
          user: newUser,
        });
      }
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUser({ username, password });
    if (!user) {
      next({ name: "userError", message: "incorrect username or password" });
    } else {
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );

      res.send({ user, message: "You have successfully logged in", token });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.get("/me", requireUser, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:username/routines", async (req, res, next) => {
  const { username } = req.params;
  try {
    const userRoutines = await getPublicRoutinesByUser({ username });
    res.send(userRoutines);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
