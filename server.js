const express = require("express");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Load valid codes from the codes.json file
const VALID_CODES = JSON.parse(fs.readFileSync("codes.json", "utf8"));

// Load and save users data from/to users.js
function loadUsersData() {
  try {
    return JSON.parse(fs.readFileSync("users.js", "utf8"));
  } catch (err) {
    // If users.js doesn't exist or is empty, return an empty object
    return {};
  }
}

function saveUsersData(data) {
  fs.writeFileSync("users.js", JSON.stringify(data, null, 2), "utf8");
}

app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Track used codes with expiration time
let usedCodes = loadUsersData();

// Check for expired codes and clean up
function cleanExpiredCodes() {
  const now = Date.now();
  for (const code in usedCodes) {
    if (usedCodes[code] < now) {
      delete usedCodes[code];
    }
  }
}

// Middleware to clean up expired codes every minute
setInterval(cleanExpiredCodes, 60000);

// Handle code input
app.post("/", (req, res) => {
  const code = req.body.code;

  // Special bypass code: "goobers"
  if (code === "goobers") {
    // No cookies, just redirect to menu
    return res.redirect("/menu");
  }

  // Validate the code
  if (!VALID_CODES.includes(code)) {
    return res.status(400).send("<h1>Invalid Code</h1>");
  }

  // Check if the code has already been used or expired
  const expirationTime = usedCodes[code];
  if (expirationTime && expirationTime > Date.now()) {
    return res.status(400).send("<h1>This code has already been used or expired.</h1>");
  }

  // Mark the code as used and set expiration time (1 hour from now)
  usedCodes[code] = Date.now() + 60 * 60 * 1000;  // Expire in 1 hour

  // Save the updated used codes to the users.js file
  saveUsersData(usedCodes);

  // Redirect to the menu page
  res.redirect("/menu");
});

app.get("/", (req, res) => {
  const codeEntered = req.cookies.codeEntered;

  // If the user has entered a valid code or used the "goobers" bypass, show the Kahoot embed
  if (codeEntered) {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    // If not, show the code input page
    return res.sendFile(path.join(__dirname, "public", "codeInput.html"));
  }
});

// Handle menu page (for after entering a valid code or special code)
app.get("/menu", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "menu.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
