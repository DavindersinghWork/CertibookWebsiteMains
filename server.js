// server.js



const express = require("express");     // Helps us create a web server
const cors = require("cors");           // Lets our frontend talk to our backend
const bcrypt = require("bcrypt");       // Used to safely hash passwords
const jwt = require("jsonwebtoken");    // Used to create login tokens

// Import our simple "fake database"
const { createUser, findUserByEmail } = require("./usersDb");


// -----------------------------
// 2. SETUP EXPRESS APP
// -----------------------------

const app = express();
const PORT = 3000;

// This key is used to create tokens.
// (Later, you should store this in .env file)
const JWT_SECRET = "my_secret_key";


// -----------------------------
// 3. USE MIDDLEWARE
// -----------------------------

app.use(cors());         // Allow requests from frontend
app.use(express.json()); // Allow JSON data in POST requests


// -----------------------------
// 4. FUNCTION TO CREATE TOKENS
// -----------------------------

// When a user logs in, we create a token for them.
// That token proves "who they are".
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email }, // Payload (data we store in token)
    JWT_SECRET,                         // Secret key to protect the token
    { expiresIn: "1h" }                 // Token expires in 1 hour
  );
}


// -----------------------------
// 5. REGISTER ROUTE (CREATE USER)
// -----------------------------

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body; // Get email & password from frontend

    // Check if email or password is missing
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password.",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Hash the password so we don't store it as plain text
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user in our fake database
    const newUser = createUser({ email, passwordHash: hashedPassword });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: { id: newUser.id, email: newUser.email },
    });

  } catch (err) {
    if (err.message === "User already exists") {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});


// -----------------------------
// 6. LOGIN ROUTE
// -----------------------------

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Make sure both fields exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password.",
      });
    }

    // Find user by email
    const user = findUserByEmail(email);

    // If no user found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    // Compare entered password with hashed password
    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    // If password matches → create token
    const token = createToken(user);

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: { id: user.id, email: user.email },
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});


// -----------------------------
// 7. SIMPLE TOKEN CHECK MIDDLEWARE
// -----------------------------

function checkToken(req, res, next) {
  // Token is sent in header: Authorization: Bearer token
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Split "Bearer token"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token found. Please log in.",
    });
  }

  // Verify token
  jwt.verify(token, JWT_SECRET, (err, userData) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Token is invalid or expired.",
      });
    }

    req.user = userData; // Save token data to request
    next(); // Continue
  });
}


// -----------------------------
// 8. AN EXAMPLE PROTECTED ROUTE
// -----------------------------

app.get("/profile", checkToken, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to your profile!",
    user: req.user,
  });
});


// -----------------------------
// 9. START THE SERVER
// -----------------------------

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
