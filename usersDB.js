// Import the driver
const mysql = require('mysql2');

// Create a connection
const connection = mysql.createConnection({
  host: 'localhost',      // database server
  port: 3306
,             // custom port
  user: 'root',           // your DB username
  password: 'Chandelatul$',   // your DB password
  database: 'certibook'      // your DB name
});

// Open the connection
connection.connect(err => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected as id ' + connection.threadId);
});

// Function to add a new user
function addUser(email, passwordHash) {
  const sql = 'INSERT INTO users (email, passwordHash) VALUES (?, ?)';
  connection.query(sql, [email, passwordHash], (err, results) => {
    if (err) {
      console.error('Error inserting user:', err.message);
      return;
    }
    //console.log("New user added with ID:", ${results.insertId});
  });
}
// Function to check if a user exists
function checkUser(email, passwordHash) {
  const sql = 'SELECT * FROM users WHERE email = ? AND passwordHash = ?';
  connection.query(sql, [email, passwordHash], (err, results) => {
    if (err) {
      console.error('Error checking user:', err.message);
      return;
    }
    if (results.length > 0) {
      console.log('User exists:', results[0]);
    } else {
      console.log('No user found with given credentials.');
    }
  });
}



// Create a new user
function createUser({ email, passwordHash }) {
  const exists = users.find((u) => u.email === email);
  if (exists) throw new Error("User already exists");

  const newUser = {
    id: users.length + 1,
    email,
    passwordHash,
  };

  users.push(newUser);
  return newUser;
}

// Find user by email
function findUserByEmail(email) {
  return users.find((u) => u.email === email);
}

module.exports = { createUser, findUserByEmail };

