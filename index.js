const express = require("express");
const pool = require("./db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("FarmBook Backend Running");
});


app.post("/api/v1/farms", async (req, res) => {
    try {
        const { name, location, total_bigha } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Farm name is required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO farms
            (name, location, total_bigha)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [name, location, total_bigha]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

/*
GET /api/v1/farms/:id
*/
app.get("/api/v1/farms/:id", async (req, res) => {
    try {
        const farmId = req.params.id;

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                location,
                total_bigha,
                created_at
            FROM farms
            WHERE id = $1
            `,
            [farmId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Farm not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});