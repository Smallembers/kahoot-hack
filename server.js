const express = require('express');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = './users.json';

app.use(cookieParser());
app.use(express.static('public'));

// Load users from users.json
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(USERS_FILE);
  return new Set(JSON.parse(data));
}

// Save users to users.json
function saveUsers(userSet) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(Array.from(userSet)));
}

app.get('/', (req, res) => {
  const userId = req.cookies.uuid;
  let users = loadUsers();

  if (userId && users.has(userId)) {
    // Returning user
    return res.sendFile(path.join(__dirname, 'public/index.html'));
  }

  if (users.size >= 2) {
    return res.status(403).send('<h1>🚫 Access Denied</h1><p>This link is limited to 2 users only.</p>');
  }

  // New user
  const newUuid = uuidv4();
  res.cookie('uuid', newUuid, { maxAge: 1000 * 60 * 60 * 24 * 30 }); // Cookie lasts 30 days
  users.add(newUuid);
  saveUsers(users);
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
