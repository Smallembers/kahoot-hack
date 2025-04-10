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
  const validCodes = [
    "2384751",
    "3847219",
    "9052137",
    "5870423",
    "6749208",
    "1234890",
    "4516273",
    "8924316",
    "5041987",
    "7365820"
  ];

  if (validCodes.includes(code)) {
    const userId = uuidv4();
    res.cookie('uuid', userId, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true }); // 30 days
    return res.redirect('/'); // Redirect to Kahoot embed page after valid code
  } else {
    return res.send('<h1>Invalid Code</h1><p>Try again with a valid code.</p>');
  }
});

// Serve the Kahoot embed page only after successful code entry
app.get('/', (req, res) => {
  const userId = req.cookies.uuid;
  if (!userId) {
    return res.redirect('/enter-code'); // Redirect to enter code if user doesn't have uuid
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
