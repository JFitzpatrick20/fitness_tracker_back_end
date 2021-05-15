const express = require("express");
const routinesRouter = express.Router();
const { requireUser } = require("./utils");
const { JWT_SECRET } = process.env;
const {
  getAllPublicRoutines,
  createRoutine,
  updateRoutine,
  destroyRoutine,
  addActivityToRoutine,
} = require("../db");

routinesRouter.get("/", async (req, res, next) => {
  try {
    const publicRoutines = await getAllPublicRoutines();
    res.send(publicRoutines);
  } catch (error) {
    next(error);
  }
});

routinesRouter.post("/", requireUser, async (req, res, next) => {
  const { id } = req.user;
  const { isPublic, name, goal } = req.body;
  try {
    const newRoutine = await createRoutine({
      creatorId: id,
      isPublic,
      name,
      goal,
    });
    res.send(newRoutine);
  } catch (error) {
    next(error);
  }
});

routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;
  try {
    const changedRoutine = await updateRoutine({
      id: routineId,
      isPublic,
      name,
      goal,
    });
    res.send(changedRoutine);
  } catch (error) {
    next(error);
  }
});

routinesRouter.delete("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  try {
    const deletedRoutine = await destroyRoutine(routineId);
    res.send(deletedRoutine);
  } catch (error) {
    next(error);
  }
});

routinesRouter.post("/:routineId/activities", async (req, res, next) => {
  const { routineId } = req.params;
  const { activityId, count, duration } = req.body;
  try {
    const routine = await addActivityToRoutine({
      routineId,
      activityId,
      count,
      duration,
    });
    res.send(routine);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = routinesRouter;
