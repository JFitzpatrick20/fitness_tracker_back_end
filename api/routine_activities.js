const express = require("express");
const {
  updateRoutineActivity,
  destroyRoutineActivity,
  getRoutineActivityById,
  getRoutineById,
} = require("../db");
const routine_activitiesRouter = express.Router();
const { requireUser } = require("./utils");

routine_activitiesRouter.patch(
  "/:routineActivityId",
  requireUser,
  async (req, res, next) => {
    const { routineActivityId } = req.params;
    const { count, duration } = req.body;
    try {
      const routineActivity = await getRoutineActivityById({
        id: routineActivityId,
      });
      const routine = await getRoutineById(routineActivity.routineId);
      if (req.user.id === routine.creatorId) {
        const updatedRoutineActivity = await updateRoutineActivity({
          id: routineActivityId,
          count,
          duration,
        });
        res.send(updatedRoutineActivity);
      } else {
        next({
          name: "RoutineActivityUpdateFailed",
          message: "No permission to edit",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

routine_activitiesRouter.delete(
  "/:routineActivityId",
  requireUser,
  async (req, res, next) => {
    const { routineActivityId } = req.params;
    try {
      const routineActivity = await getRoutineActivityById({
        id: routineActivityId,
      });
      const routine = await getRoutineById(routineActivity.routineId);
      if (req.user.id === routine.creatorId) {
        const deletedActivity = await destroyRoutineActivity(routineActivityId);
        res.send(deletedActivity);
      } else {
        next({
          name: "RoutineActivityUpdateFailed",
          message: "No permission to delete",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

module.exports = routine_activitiesRouter;
