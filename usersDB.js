const mysql = require("mysql2/promise");

// Create connection pool
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Chandelatul$",   // your password
    database: "certibook",
    port: 3307                   // change ONLY if needed
});

// REGISTER USER
async function createUser({ email, passwordHash }) {
    const sql = "INSERT INTO users (email, passwordHash) VALUES (?, ?)";

    try {
        const [result] = await db.execute(sql, [email, passwordHash]);
        return { id: result.insertId, email, passwordHash };
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            throw new Error("User already exists");
        }
        throw err;
    }
}

// FIND USER BY EMAIL
async function findUserByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = ?";

    const [rows] = await db.execute(sql, [email]);
    return rows.length > 0 ? rows[0] : null;
}

// SAVE STUDENT INFO
async function saveStudentInfo(studentNumber, studentEmail) {
    const sql = "INSERT INTO students (studentNumber, studentEmail) VALUES (?, ?)";
    await db.execute(sql, [studentNumber, studentEmail]);
}

module.exports = {
    createUser,
    findUserByEmail,
    saveStudentInfo
};


