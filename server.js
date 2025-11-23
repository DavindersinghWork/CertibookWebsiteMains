const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const { 
  createUser, 
  findUserByEmail, 
  saveStudentInfo,
  getStudentProfileByUserId 
} = require("./usersDB");

const app = express();
const PORT = 5000;
const JWT_SECRET = "secretkey123";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing fields." });

    const hash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, passwordHash: hash });

    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    if (err.message === "User already exists")
      return res.status(409).json({ message: "Email already registered." });

    res.status(500).json({ message: "Server error." });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid login." });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid login." });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error." });
  }
});
// login by role
app.post("/select-role", (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: "Role not selected." });
  }

  // Redirect based on role
  let redirectPage = "";

  if (role === "student") redirectPage = "certibook_student_portal.html";
  if (role === "employer") redirectPage = "certibook_employer_portal.html";
  if (role === "academic") redirectPage = "welcome.html";

  return res.json({ redirect: redirectPage });
});

// SAVE STUDENT INFO
app.post("/student-info", async (req, res) => {
  try {
    const { studentNumber, studentEmail } = req.body;

    await saveStudentInfo(studentNumber, studentEmail);
    res.json({ success: true });
  } catch (err) {
    console.error("STUDENT INFO ERROR:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// GET STUDENT PROFILE  
app.get("/api/profile", async (req, res) => {
  try {
    const userId = 1;  // you will later replace with JWT

    const profile = await getStudentProfileByUserId(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.json({ success: true, profile });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

