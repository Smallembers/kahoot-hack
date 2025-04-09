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

// Load or create users file
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]');
  }
  return new Set(JSON.parse(fs.readFileSync(USERS_FILE)));
}

function saveUsers(userSet) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([...userSet]));
}

app.use((req, res, next) => {
  let userId = req.cookies.userId;
  let users = loadUsers();

  if (!userId) {
    userId = uuidv4();
    res.cookie('userId', userId, { httpOnly: true });
  }

  if (!users.has(userId)) {
    if (users.size >= 2) {
      return res.status(403).send(`
        <h1>Access Denied</h1>
        <p>This website is limited to 2 unique users.</p>
      `);
    }
    users.add(userId);
    saveUsers(users);
  }

  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
