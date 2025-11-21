// usersDb.js (simple fake in-memory DB)

let users = [];

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

module.exports = { createUser, findUserByEmail };
