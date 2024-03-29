const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
          SELECT *
          FROM routines
          WHERE id=$1;
          `,
      [id]
    );
    if (!routine) {
      return null;
    }
    return routine;
  } catch (error) {
    throw error;
  }
}

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
        INSERT INTO routines("creatorId", "isPublic", name, goal)
        VALUES($1, $2, $3, $4)
        RETURNING *;
        `,
      [creatorId, isPublic, name, goal]
    );
    return routine;
  } catch (error) {
    console.error("createRoutine error");
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows: routines } = await client.query(`
    SELECT *
    FROM routines;
    `);
    return routines;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routine } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    `);
    return attachActivitiesToRoutines(routine);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routine } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "isPublic" = true
    `);
    return attachActivitiesToRoutines(routine);
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routine } = await client.query(
      `
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE users.username = $1
    `,
      [username]
    );
    return attachActivitiesToRoutines(routine);
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routine } = await client.query(
      `
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE users.username = $1
    AND "isPublic" = true 
    `,
      [username]
    );
    return attachActivitiesToRoutines(routine);
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(
      `
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routines.id = routine_activities."routineId"
    WHERE routines."isPublic" = true
    AND routine_activities."activityId" = $1;
    `,
      [id]
    );
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  try {
    const { rows } = await client.query(
      `
    UPDATE routines
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `,
      Object.values(fields)
    );

    return rows[0];
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
    DELETE FROM routines
        WHERE id= $1
        RETURNING *;
    `,
      [id]
    );
    await client.query(
      `
    DELETE FROM routine_activities
    WHERE "routineId" = $1

    `,
      [id]
    );
    return routine;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createRoutine,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getRoutineById,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  updateRoutine,
  destroyRoutine,
  getPublicRoutinesByActivity,
};
