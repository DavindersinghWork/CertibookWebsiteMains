const mysql = require("mysql2/promise");

// Create MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Chandelatul$",  
  database: "certibook",
  port: 3307
});

// REGISTER USER
async function createUser({ email, passwordHash }) {
  const sql = "INSERT INTO users (email, passwordHash) VALUES (?, ?)";
  const [result] = await pool.execute(sql, [email, passwordHash]);
  return { id: result.insertId, email, passwordHash };
}

// FIND USER BY EMAIL
async function findUserByEmail(email) {
  const sql = "SELECT * FROM users WHERE email = ?";
  const [rows] = await pool.execute(sql, [email]);
  return rows.length ? rows[0] : null;
}

// SAVE STUDENT INFO
async function saveStudentInfo(studentNumber, studentEmail) {
  const sql = "INSERT INTO students (studentNumber, studentEmail) VALUES (?, ?)";
  await pool.execute(sql, [studentNumber, studentEmail]);
}

// GET STUDENT PROFILE BY USER ID
async function getStudentProfileByUserId(userId) {
  const sql = `
    SELECT firstName, lastName, dob, email, contact, institution, photoUrl
    FROM student_profiles
    WHERE userId = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [userId]);
  return rows.length ? rows[0] : null;
}

module.exports = {
  createUser,
  findUserByEmail,
  saveStudentInfo,
  getStudentProfileByUserId
};
