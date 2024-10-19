exports.query_manager = require("knex")({
  client: "mysql2",
  connection: {
    host: "zumatest.cv00wewq0dtg.us-west-2.rds.amazonaws.com",
    user: "admin",
    port: 3306,
    password: "Omariscool1234!",
    database: "OscarBlog",
    // ssl: sslOptions,
  },
  debug: false,
});
