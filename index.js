const prisma = require("./utils/prisma");
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

        const existingUser = await prisma.users.findUnique({
            where:{
                email
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
    data: {
        name,
        email,
        password_hash: hashedPassword,
        role
    },
    select: {
        id: true,
        name: true,
        email: true,
        role: true
    }
});

        res.status(201).json(user);

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

        const user = await prisma.users.findUnique({
    where: {
        email
    }
});

if (!user) {
    return res.status(401).json({
        message: "User does not exist with this email"
    });
}

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

          const farm = await prisma.farms.create({
                data: {
                name,
                location,
                total_bigha
            }
        });

            res.status(201).json(farm);

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

const farm = await prisma.farms.findUnique({
    where: {
        id: Number(farmId)
    }
});

if (!farm) {
    return res.status(404).json({
        message: "Farm not found"
    });
}

res.status(200).json(farm);

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