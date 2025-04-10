const express = require('express');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = './users.json';

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the "public" folder

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

// Serve login page
app.get('/login', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #9b59b6;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .form-container {
            background: rgba(0, 0, 0, 0.7);
            padding: 30px;
            border-radius: 8px;
            width: 300px;
            text-align: center;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
          }
          input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 2px solid #fff;
            border-radius: 4px;
            background: transparent;
            color: #fff;
            font-size: 16px;
          }
          button {
            width: 100%;
            padding: 12px;
            background: #e74c3c;
            border: none;
            border-radius: 4px;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
          }
          button:hover {
            background: #c0392b;
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <h1>Login</h1>
          <form method="POST" action="/login">
            <input type="text" name="username" placeholder="Enter Username" required />
            <button type="submit">Login</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// Handle login
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (username) {
    const userId = uuidv4();
    res.cookie('uuid', userId, { maxAge: 1000 * 60 * 60 * 24 * 30 }); // 30 days
    res.redirect('/enter-code');
  } else {
    res.send("Please provide a valid username.");
  }
});

// Serve the enter-code page with the 7-digit code form
app.get('/enter-code', (req, res) => {
  res.send(`
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Enter 7-Digit Code</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(45deg, #9b59b6, #e74c3c);
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .form-container {
            background: rgba(0, 0, 0, 0.7);
            padding: 30px;
            border-radius: 8px;
            width: 300px;
            text-align: center;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
          }
          input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 2px solid #fff;
            border-radius: 4px;
            background: transparent;
            color: #fff;
            font-size: 16px;
          }
          button {
            width: 100%;
            padding: 12px;
            background: #e74c3c;
            border: none;
            border-radius: 4px;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
          }
          button:hover {
            background: #c0392b;
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <h1>Enter 7-Digit Code</h1>
          <form method="POST" action="/enter-code">
            <input type="text" name="code" placeholder="Enter Code" required />
            <button type="submit">Submit</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// Handle 7-digit code submission
app.post('/enter-code', (req, res) => {
  const { code } = req.body;
  const validCodes = ["1234567", "7654321", "9876543", "6543210", "2468135", "1357924", "1928374", "2837465", "3748291", "8473625"];

  if (validCodes.includes(code)) {
    res.redirect('/');
  } else {
    res.send('<h1>Invalid Code</h1><p>Try again with a valid code.</p>');
  }
});

// Serve the Kahoot embed page only after successful login and code entry
app.get('/', (req, res) => {
  const userId = req.cookies.uuid;
  if (!userId) {
    return res.redirect('/login');
  }

  // Serve Kahoot embed
  res.send(`
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kahoot Embed</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe src="https://kahoot.club" allowfullscreen></iframe>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
