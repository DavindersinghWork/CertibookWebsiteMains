const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { createUser, findUserByEmail } = require("./usersDB");

const app = express();
const PORT = 3000;

const JWT_SECRET = "my_secret_key";

// Middlewares
app.use(cors());
app.use(express.json());

// Create a token
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Register route
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password too short" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = createUser({ email, passwordHash: hashed });

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    if (err.message === "User already exists") {
      return res.status(409).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = findUserByEmail(email);
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = createToken(user);

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
