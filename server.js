const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

// IMPORT MySQL functions (must be async)
const { createUser, findUserByEmail } = require("./usersDB");

const app = express();
const PORT = 3000;

const JWT_SECRET = "my_secret_key";

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());

// serve HTML files
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// ===== TOKEN HELPER =====
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// ===== REGISTER ROUTE =====
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("REGISTER ATTEMPT:", email);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // IMPORTANT: await MySQL function
    const newUser = await createUser({ email, passwordHash: hashed });

    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error(err);
    if (err.message === "User already exists") {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== LOGIN ROUTE =====
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN ATTEMPT:", email);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // IMPORTANT: await MySQL result
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user);

    return res.json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== STUDENT INFO ROUTE =====
app.post("/student-info", (req, res) => {
  const { studentNumber, studentEmail } = req.body;

  if (!studentNumber || !studentEmail) {
    return res.status(400).json({ message: "Missing student info" });
  }

  console.log("Received student-info:", studentNumber, studentEmail);

  res.json({
    success: true,
    message: "Student info saved successfully!",
    studentNumber,
    studentEmail,
  });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
