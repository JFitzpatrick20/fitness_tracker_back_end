const express = require("express");
const activitiesRouter = express.Router();
const { requireUser } = require("./utils");
const {
  getAllActivities,
  createActivity,
  updateActivity,
  getPublicRoutinesByActivity,
} = require("../db");

activitiesRouter.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.post("/", requireUser, async (req, res, next) => {
  const { name, description } = req.body;
  try {
    const newActivity = await createActivity({ name, description });
    res.send(newActivity);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

activitiesRouter.patch("/:activityId", requireUser, async (req, res, next) => {
  const { activityId } = req.params;
  const { name, description } = req.body;
  try {
    const patchedActivity = await updateActivity({
      id: activityId,
      name,
      description,
    });
    res.send(patchedActivity);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
  const { id } = req.body;
  console.log(req.body, "HHHHHHHHHHHHHHHHHH");
  try {
    const routines = await getPublicRoutinesByActivity({ id });
    res.send(routines);
  } catch (error) {
    next(error);
  }
});

module.exports = activitiesRouter;
