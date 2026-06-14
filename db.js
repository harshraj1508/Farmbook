const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "farmbook",
    password: "harsh@123",
    port: 5432
});

pool.connect()
    .then(() => {
        console.log("Connected to PostgreSQL");
    })
    .catch((err) => {
        console.error("Database connection error:", err);
    });

module.exports = pool;



