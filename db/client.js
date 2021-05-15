// build and export your unconnected client here

const { Client } = require("pg");
const client = new Client("postgres://localhost:5432/fitness-dev");

module.exports = client;

// const { Client } = require("pg");

// const connectionString =
//   process.env.DATABASE_URL || "https://localhost:5432/fitness-dev";

// const client = new Client({
//   connectionString,
//   ssl:
//     process.env.NODE_ENV === "production"
//       ? { rejectUnauthorized: false }
//       : undefined,
// });

// module.exports = client;
