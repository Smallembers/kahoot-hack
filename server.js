const express = require('express');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = './users.json';
const CODE = '1234567';  // Hardcoded 7-digit code (you can change it)

// Middleware setup
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));  // To parse form data

// Load users from users.json
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

// Save users to users.json
function saveUsers(userList) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(userList));
}

// Login route
app.get('/login', (req, res) => {
  res.send(`
    <form method="POST" action="/login">
      <input type="text" name="username" placeholder="Enter your username" required />
      <button type="submit">Login</button>
    </form>
  `);
});

// Handle login
app.post('/login', (req, res) => {
  const { username } = req.body;
  const users = loadUsers();

  if (username) {
    const userId = uuidv4(); // Create a unique ID for the user
    const newUser = { username, userId };
    users.push(newUser); // Add user to the list
    saveUsers(users);

    // Store user's session in a cookie
    res.cookie('userId', userId, { maxAge: 1000 * 60 * 60 * 24 * 30 });
    res.redirect('/enter-code');
  } else {
    res.send('Please provide a valid username.');
  }
});

// Route for entering the 7-digit code
app.get('/enter-code', (req, res) => {
  res.send(`
    <form method="POST" action="/enter-code">
      <input type="text" name="code" placeholder="Enter 7-digit code" required />
      <button type="submit">Submit</button>
    </form>
  `);
});

// Handle code entry
app.post('/enter-code', (req, res) => {
  const { code } = req.body;
  if (code === CODE) {
    // Code is correct, show the Kahoot embed
    res.redirect('/');
  } else {
    res.send('<h1>Invalid code. Please try again.</h1>');
  }
});

// Serve Kahoot embed if logged in and code is entered correctly
app.get('/', (req, res) => {
  const userId = req.cookies.userId;
  const users = loadUsers();

  // Check if user is logged in
  const user = users.find(u => u.userId === userId);

  if (user) {
    res.sendFile(path.join(__dirname, 'public/index.html')); // Send Kahoot embed page
  } else {
    res.redirect('/login'); // Redirect to login if not logged in
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
