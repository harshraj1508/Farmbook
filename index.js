const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("./db");
const authenticateToken = require("./middleware/auth");
const authorizeRoles = require("./middleware/role");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("FarmBook Backend Running");
});

/*
REGISTER
*/
app.post("/api/v1/auth/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `
            INSERT INTO users
            (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role
            `,
            [name, email, hashedPassword, role]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

/*
LOGIN
*/
app.post("/api/v1/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "user does not exist with this email"
            });
        }

        const user = result.rows[0];

        const isValidPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }
 
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            "farmbook-secret",
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            token
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

/*
CREATE FARM
JWT PROTECTED
*/
app.post(
    "/api/v1/farms",
    authenticateToken,authorizeRoles("OWNER"),
    async (req, res) => {
        try {
            const { name, location, total_bigha } = req.body;

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
    }
);

/*
GET FARM
*/
app.get("/api/v1/farms/:id",authenticateToken, authorizeRoles("OWNER","manager"), async (req, res) => {
    try {
        const farmId = req.params.id;

        const result = await pool.query(
            "SELECT * FROM farms WHERE id = $1",
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