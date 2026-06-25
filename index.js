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
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed",
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
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User does not exist with this email",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      "farmbook-secret",
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

/*
CREATE FARM
JWT PROTECTED
*/
app.post(
  "/api/v1/farms",
  authenticateToken,
  authorizeRoles("OWNER"),
  async (req, res) => {
    try {
      const { name, location, total_bigha } = req.body;

      const farm = await prisma.farms.create({
        data: {
          name,
          location,
          total_bigha,
        },
      });

      res.status(201).json(farm);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
);

/*
GET FARM
*/
app.get(
  "/api/v1/farms/:id",
  authenticateToken,
  authorizeRoles("OWNER", "manager"),
  async (req, res) => {
    try {
      const farmId = req.params.id;

      const farm = await prisma.farms.findUnique({
        where: {
          id: Number(farmId),
        },
      });

      if (!farm) {
        return res.status(404).json({
          message: "Farm not found",
        });
      }

      res.status(200).json(farm);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
);

/*
CREATE PLOT
JWT PROTECTED
*/
app.post(
  "/api/v1/farms/:id/plots",
  authenticateToken,
  authorizeRoles("OWNER"),
  async (req, res) => {
    try {
      const farm_id = Number(req.params.id);
      const { name, area_bigha, label_color, status } = req.body;

      const plots = await prisma.plots.create({
        data: {
          farm_id,
          name,
          area_bigha,
          label_color,
          status,
        },
      });

      res.status(201).json(plots);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
);

/*
CREATE PLANTING
JWT PROTECTED
*/
app.post(
  "/api/v1/plots/:id/plantings",
  authenticateToken,
  authorizeRoles("OWNER"),
  async (req, res) => {
    try {
      const plot_id = Number(req.params.id);
      const { crop_id, sow_date, plant_count, expected_harvest, status } =
        req.body;

      const plantings = await prisma.plantings.create({
        data: {
          plot_id,
          crop_id,
          sow_date,
          plant_count,
          expected_harvest,
          status,
        },
      });

      res.status(201).json(plantings);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
);

/*
CREATE CROP
JWT PROTECTED
*/
app.post(
  "/api/v1/crops",
  authenticateToken,
  authorizeRoles("OWNER"),
  async (req, res) => {
    try {
      const { name, variety, protocol } = req.body;

      const crop = await prisma.crop.create({
        data: {
          name,
          variety,
          protocol,
        },
      });

      res.status(201).json(crop);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
);

/*
CREATE PLANTING
JWT PROTECTED
*/
app.put(
  "/api/v1/plantings/:id/close",
  authenticateToken,
  authorizeRoles("OWNER"),
  async (req, res) => {
    try {
      const planting_id = Number(req.params.id);

      const planting = await prisma.plantings.update({
        where: {
          id:planting_id
        },
        data: {
          status: "CLOSED",
        },
      });
      
      res.status(201).json(planting);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
