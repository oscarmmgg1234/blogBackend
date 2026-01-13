exports.query_manager = require("knex")({
  client: "mysql2",
  connection: {
    host: "localhost",
    user: "blogadmin",
    port: 3306,
    password: "Oscythetechguy1!",
    database: "blogbackend",
    // ssl: sslOptions,
  },
  debug: false,
});
